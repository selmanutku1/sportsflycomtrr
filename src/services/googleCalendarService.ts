import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AntrenmanItem } from '../types';

// Initialize Firebase App safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Calendar Events Scope
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in progress
let isSigningIn = false;
// In-memory cache for the access token (never stored in localStorage)
let cachedAccessToken: string | null = null;
let currentUserProfile: User | null = null;

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  htmlLink?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  attendees?: Array<{ email: string; displayName?: string }>;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export interface SyncStatus {
  isConnected: boolean;
  userEmail: string | null;
  userName: string | null;
  userPhoto: string | null;
  syncedCount: number;
}

// Global event listener helpers
type AuthStateCallback = (user: User | null, token: string | null) => void;
const listeners: Set<AuthStateCallback> = new Set();

const notifyListeners = (user: User | null, token: string | null) => {
  currentUserProfile = user;
  cachedAccessToken = token;
  listeners.forEach((cb) => cb(user, token));
};

// Initialize auth state listener
export const initCalendarAuth = (callback?: AuthStateCallback) => {
  if (callback) {
    listeners.add(callback);
    // Call immediately if state exists
    if (currentUserProfile && cachedAccessToken) {
      callback(currentUserProfile, cachedAccessToken);
    }
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        notifyListeners(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might have expired or wasn't cached yet
        notifyListeners(user, null);
      }
    } else {
      cachedAccessToken = null;
      notifyListeners(null, null);
    }
  });
};

export const subscribeToCalendarAuth = (callback: AuthStateCallback) => {
  listeners.add(callback);
  if (currentUserProfile) {
    callback(currentUserProfile, cachedAccessToken);
  }
  return () => {
    listeners.delete(callback);
  };
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return currentUserProfile;
};

// Sign in with Google Popup
export const signInWithGoogleCalendar = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Google erişim anahtarı alınamadı.');
    }

    cachedAccessToken = credential.accessToken;
    currentUserProfile = result.user;
    notifyListeners(result.user, cachedAccessToken);

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out from Google
export const disconnectGoogleCalendar = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUserProfile = null;
  notifyListeners(null, null);
};

// Map AntrenmanItem to Google Calendar Event payload
export const mapAntrenmanToGoogleEvent = (
  antrenman: AntrenmanItem,
  reminderMinutes = 30
): GoogleCalendarEvent => {
  // antrenman.date is 'YYYY-MM-DD', startTime is 'HH:mm', endTime is 'HH:mm'
  const startDateTime = `${antrenman.date}T${antrenman.startTime}:00`;
  const endDateTime = `${antrenman.date}T${antrenman.endTime}:00`;

  const attendeesList = (antrenman.attendees || []).map((att) => ({
    email: att.phone ? `${att.phone.replace(/[^0-9]/g, '')}@sporcu.sportsfly.club` : `${att.name.toLowerCase().replace(/\s+/g, '.')}@sporcu.sportsfly.club`,
    displayName: att.name,
  }));

  const descriptionLines = [
    `🏅 Branş: ${antrenman.branch}`,
    `👥 Grup: ${antrenman.groupName}`,
    `👤 Antrenör: ${antrenman.trainerName}`,
    `🏢 Şube / Tesis: ${antrenman.sube || ''} - ${antrenman.facilityName || ''}`,
    `📊 Katılımcı: ${(antrenman.attendees || []).filter(a => a.present).length}/${antrenman.capacity || 20}`,
    antrenman.notes ? `📝 Notlar: ${antrenman.notes}` : '',
    '',
    '🚀 SportsFly Kulüp & Antrenman Yönetim Sistemi ile senkronize edilmiştir.',
  ].filter(Boolean);

  return {
    summary: `[${antrenman.branch}] ${antrenman.title} (${antrenman.groupName})`,
    description: descriptionLines.join('\n'),
    location: `${antrenman.facilityName || ''}, ${antrenman.sube || ''}`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: 'Europe/Istanbul',
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: 'Europe/Istanbul',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes },
        { method: 'email', minutes: 60 },
      ],
    },
    extendedProperties: {
      private: {
        sportsflySessionId: antrenman.id,
        branch: antrenman.branch,
        groupName: antrenman.groupName,
      },
    },
    attendees: attendeesList.length > 0 ? attendeesList.slice(0, 10) : undefined,
  };
};

// Create or update a single session in Google Calendar
export const pushSessionToGoogleCalendar = async (
  antrenman: AntrenmanItem,
  token?: string,
  reminderMinutes = 30
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  const accessToken = token || cachedAccessToken;
  if (!accessToken) {
    return { success: false, error: 'Google Takvim oturumu açık değil. Lütfen önce Google ile bağlanın.' };
  }

  try {
    const payload = mapAntrenmanToGoogleEvent(antrenman, reminderMinutes);

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Calendar API Hatası: ${res.statusText}`);
    }

    const createdEvent = await res.json();
    return {
      success: true,
      eventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
    };
  } catch (err: any) {
    console.error('Google Calendar event creation error:', err);
    return { success: false, error: err.message || 'Antrenman takvime eklenirken bir hata oluştu.' };
  }
};

// Batch push multiple sessions to Google Calendar
export const batchPushSessionsToGoogleCalendar = async (
  sessions: AntrenmanItem[],
  token?: string,
  reminderMinutes = 30
): Promise<{
  total: number;
  successful: number;
  failed: number;
  syncedSessionIds: Record<string, { eventId: string; htmlLink: string }>;
  errors: string[];
}> => {
  const accessToken = token || cachedAccessToken;
  if (!accessToken) {
    throw new Error('Google Takvim oturumu açık değil.');
  }

  const syncedSessionIds: Record<string, { eventId: string; htmlLink: string }> = {};
  const errors: string[] = [];
  let successful = 0;
  let failed = 0;

  for (const session of sessions) {
    try {
      const res = await pushSessionToGoogleCalendar(session, accessToken, reminderMinutes);
      if (res.success && res.eventId) {
        successful++;
        syncedSessionIds[session.id] = {
          eventId: res.eventId,
          htmlLink: res.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${res.eventId}`,
        };
      } else {
        failed++;
        errors.push(`${session.title}: ${res.error}`);
      }
    } catch (e: any) {
      failed++;
      errors.push(`${session.title}: ${e.message}`);
    }
  }

  return {
    total: sessions.length,
    successful,
    failed,
    syncedSessionIds,
    errors,
  };
};

// Fetch upcoming events from Google Calendar
export const fetchGoogleCalendarEvents = async (
  token?: string,
  maxResults = 25
): Promise<{ success: boolean; events?: GoogleCalendarEvent[]; error?: string }> => {
  const accessToken = token || cachedAccessToken;
  if (!accessToken) {
    return { success: false, error: 'Oturum açılmamış.' };
  }

  try {
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin
    )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Google takvim etkinlikleri getirilemedi.');
    }

    const data = await res.json();
    return { success: true, events: data.items || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Delete event from Google Calendar (MANDATORY User confirmation handled by caller or dialog)
export const deleteGoogleCalendarEvent = async (
  eventId: string,
  token?: string
): Promise<{ success: boolean; error?: string }> => {
  const accessToken = token || cachedAccessToken;
  if (!accessToken) {
    return { success: false, error: 'Oturum açılmamış.' };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok && res.status !== 404 && res.status !== 410) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Etkinlik Google Takvimden silinemedi.');
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
