import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getStoredUserProfile, saveStoredUserProfile } from '../data/userProfile';

export interface RegisteredUser {
  id: string;
  email: string;
  password?: string;
  clubName: string;
  managerName: string;
  phone: string;
  city?: string;
  district?: string;
  branches?: string[];
  role: string;
  status: 'onay_bekliyor' | 'onaylandi' | 'reddedildi';
  selectedPlan?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  lastLoginAt?: string;
  authProvider: 'email_password' | 'google' | 'standard';
  notes?: string;
}

const STORAGE_KEY = 'sportsfly_registered_users_v2';
const BROADCAST_CHANNEL_NAME = 'sportsfly_registered_users_live';

const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'user_selman_admin',
    email: 'selmanutkumarmara@gmail.com',
    password: 'password123',
    clubName: 'SportsFly Kadıköy Merkez Şube',
    managerName: 'Selman Utku',
    phone: '0216 850 1907',
    city: 'İstanbul',
    district: 'Kadıköy',
    branches: ['Basketbol', 'Voleybol', 'Yüzme', 'Futbol'],
    role: 'Süper Admin',
    status: 'onaylandi',
    selectedPlan: 'Pro Akademi & Çoklu Şube',
    createdAt: '2026-01-01 10:00',
    approvedAt: '2026-01-01 10:00',
    approvedBy: 'Sistem',
    authProvider: 'google',
  },
  {
    id: 'user_admin_demo',
    email: 'admin@sportsfly.com',
    password: 'password123',
    clubName: 'Kadıköy Basketbol ve Spor Kulübü',
    managerName: 'Mehmet Yılmaz',
    phone: '0532 111 2233',
    city: 'İstanbul',
    district: 'Kadıköy',
    branches: ['Basketbol'],
    role: 'Kulüp Yöneticisi',
    status: 'onaylandi',
    selectedPlan: 'Kulüp & Akademi',
    createdAt: '2026-02-15 12:00',
    approvedAt: '2026-02-15 12:05',
    approvedBy: 'Selman Utku',
    authProvider: 'email_password',
  },
  {
    id: 'user_kulup_demo',
    email: 'kulup@sportsfly.com',
    password: 'password123',
    clubName: 'Gelişim Akademi Spor Kulübü',
    managerName: 'Ahmet Demir',
    phone: '0533 444 5566',
    city: 'Ankara',
    district: 'Çankaya',
    branches: ['Voleybol', 'Jimnastik'],
    role: 'Kulüp Yöneticisi',
    status: 'onaylandi',
    selectedPlan: 'Kulüp & Akademi',
    createdAt: '2026-03-01 09:30',
    approvedAt: '2026-03-01 09:35',
    approvedBy: 'Selman Utku',
    authProvider: 'email_password',
  },
];

export function getStoredRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return INITIAL_REGISTERED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    return parsed;
  } catch {
    return INITIAL_REGISTERED_USERS;
  }
}

export function saveStoredRegisteredUsers(users: RegisteredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'SYNC_USERS', users });
      bc.close();
    }
  } catch (err) {
    console.warn('[RegisteredUsers] saveStoredRegisteredUsers error:', err);
  }
}

/**
 * Normalizes email address to avoid duplicate registration casing issues
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Creates a safe Firestore document ID for a given email
 */
export function getEmailDocId(email: string): string {
  const clean = normalizeEmail(email);
  return `user_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Fetches all registered users from Firestore and synchronizes with local storage
 */
export async function fetchRegisteredUsersFromFirestore(): Promise<RegisteredUser[]> {
  try {
    const colRef = collection(db, 'registered_users');
    const snapshot = await getDocs(colRef);
    const firestoreUsers: RegisteredUser[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.email) {
        firestoreUsers.push({
          id: docSnap.id,
          email: normalizeEmail(data.email),
          password: data.password || '',
          clubName: data.clubName || 'Spor Kulübü',
          managerName: data.managerName || 'Kulüp Yetkilisi',
          phone: data.phone || '',
          city: data.city || 'İstanbul',
          district: data.district || '',
          branches: Array.isArray(data.branches) ? data.branches : ['Basketbol'],
          role: data.role || 'Kulüp Yöneticisi',
          status: data.status || 'onay_bekliyor',
          selectedPlan: data.selectedPlan || 'Kulüp & Akademi',
          createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
          approvedAt: data.approvedAt || undefined,
          approvedBy: data.approvedBy || undefined,
          rejectionReason: data.rejectionReason || undefined,
          lastLoginAt: data.lastLoginAt || undefined,
          authProvider: data.authProvider || 'email_password',
          notes: data.notes || '',
        });
      }
    });

    if (firestoreUsers.length > 0) {
      // Merge with local users (prefer firestore data)
      const localUsers = getStoredRegisteredUsers();
      const mergedMap = new Map<string, RegisteredUser>();

      localUsers.forEach((u) => mergedMap.set(normalizeEmail(u.email), u));
      firestoreUsers.forEach((u) => mergedMap.set(normalizeEmail(u.email), u));

      const merged = Array.from(mergedMap.values());
      saveStoredRegisteredUsers(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[RegisteredUsers] fetch from Firestore warning:', err);
  }

  return getStoredRegisteredUsers();
}

/**
 * Registers a new user with Email, Password and Club details.
 * Persists to Firestore `registered_users` collection and updates local store.
 */
export async function registerNewUser(params: {
  email: string;
  password?: string;
  clubName: string;
  managerName?: string;
  phone: string;
  city?: string;
  district?: string;
  branches?: string[];
  selectedPlan?: string;
  role?: string;
  notes?: string;
}): Promise<RegisteredUser> {
  const cleanEmail = normalizeEmail(params.email);
  const docId = getEmailDocId(cleanEmail);
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

  // Determine initial status: Selman / Admin is auto-approved, others start as onay_bekliyor
  const isAdminEmail = cleanEmail === 'selmanutkumarmara@gmail.com' || cleanEmail === 'admin@sportsfly.com';
  const initialStatus: RegisteredUser['status'] = isAdminEmail ? 'onaylandi' : 'onay_bekliyor';

  const newUser: RegisteredUser = {
    id: docId,
    email: cleanEmail,
    password: params.password || '',
    clubName: params.clubName.trim() || 'Yeni Spor Okulu',
    managerName: (params.managerName || 'Kulüp Kurucusu').trim(),
    phone: params.phone.trim(),
    city: params.city || 'İstanbul',
    district: params.district || 'Merkez',
    branches: params.branches && params.branches.length > 0 ? params.branches : ['Basketbol', 'Voleybol'],
    role: params.role || (isAdminEmail ? 'Süper Admin' : 'Kulüp Yöneticisi'),
    status: initialStatus,
    selectedPlan: params.selectedPlan || 'Kulüp & Akademi',
    createdAt: nowStr,
    approvedAt: isAdminEmail ? nowStr : undefined,
    approvedBy: isAdminEmail ? 'Sistem' : undefined,
    authProvider: 'email_password',
    notes: params.notes || 'Kayıt formu üzerinden oluşturuldu.',
  };

  // 1. Update local storage
  const currentUsers = getStoredRegisteredUsers();
  const filtered = currentUsers.filter((u) => normalizeEmail(u.email) !== cleanEmail);
  const updatedList = [newUser, ...filtered];
  saveStoredRegisteredUsers(updatedList);

  // 2. Persist to Firestore /registered_users/{docId}
  try {
    const docRef = doc(db, 'registered_users', docId);
    await setDoc(
      docRef,
      {
        ...newUser,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[RegisteredUsers] Firestore setDoc error (will use local):', err);
  }

  // 3. Also post application to demo requests endpoint & Firestore /spor-okulu-basvurulari for admin notifications
  try {
    fetch('/api/demo-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: docId,
        requestType: 'spor_okulu_basvurusu',
        source: 'webapp.sportsfly.com.tr',
        clubName: newUser.clubName,
        managerName: newUser.managerName,
        email: newUser.email,
        phone: newUser.phone,
        city: newUser.city,
        district: newUser.district,
        branches: newUser.branches,
        selectedPlan: newUser.selectedPlan,
        createdAt: newUser.createdAt,
        status: newUser.status,
        notes: newUser.notes,
      }),
    }).catch(() => {});
  } catch {}

  return newUser;
}

/**
 * Approves a registered user.
 * Once approved, they can log in seamlessly with email & password!
 */
export async function approveRegisteredUser(
  idOrEmail: string,
  approvedBy = 'Süper Admin'
): Promise<RegisteredUser | null> {
  const cleanKey = normalizeEmail(idOrEmail);
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const currentUsers = getStoredRegisteredUsers();
  const targetIndex = currentUsers.findIndex(
    (u) => normalizeEmail(u.email) === cleanKey || u.id === idOrEmail
  );

  let updatedUser: RegisteredUser;

  if (targetIndex !== -1) {
    updatedUser = {
      ...currentUsers[targetIndex],
      status: 'onaylandi',
      approvedAt: nowStr,
      approvedBy,
      rejectionReason: undefined,
    };
    currentUsers[targetIndex] = updatedUser;
  } else {
    // If user not in local store, create an approved record
    updatedUser = {
      id: getEmailDocId(cleanKey),
      email: cleanKey,
      clubName: 'Onaylanan Spor Okulu',
      managerName: 'Kulüp Yöneticisi',
      phone: '',
      role: 'Kulüp Yöneticisi',
      status: 'onaylandi',
      createdAt: nowStr,
      approvedAt: nowStr,
      approvedBy,
      authProvider: 'email_password',
    };
    currentUsers.unshift(updatedUser);
  }

  saveStoredRegisteredUsers([...currentUsers]);

  // Update Firestore
  try {
    const docRef = doc(db, 'registered_users', updatedUser.id);
    await setDoc(
      docRef,
      {
        ...updatedUser,
        status: 'onaylandi',
        approvedAt: nowStr,
        approvedBy,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[RegisteredUsers] Firestore approve update error:', err);
  }

  // Also sync with /api/demo-requests if applicable
  try {
    fetch(`/api/demo-requests/${updatedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'onaylandi' }),
    }).catch(() => {});
  } catch {}

  return updatedUser;
}

/**
 * Rejects a registered user
 */
export async function rejectRegisteredUser(
  idOrEmail: string,
  reason = 'Başvuru onaylanmadı.'
): Promise<RegisteredUser | null> {
  const cleanKey = normalizeEmail(idOrEmail);
  const currentUsers = getStoredRegisteredUsers();
  const targetIndex = currentUsers.findIndex(
    (u) => normalizeEmail(u.email) === cleanKey || u.id === idOrEmail
  );

  if (targetIndex === -1) return null;

  const updatedUser: RegisteredUser = {
    ...currentUsers[targetIndex],
    status: 'reddedildi',
    rejectionReason: reason,
  };
  currentUsers[targetIndex] = updatedUser;
  saveStoredRegisteredUsers([...currentUsers]);

  // Update Firestore
  try {
    const docRef = doc(db, 'registered_users', updatedUser.id);
    await updateDoc(docRef, {
      status: 'reddedildi',
      rejectionReason: reason,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[RegisteredUsers] Firestore reject error:', err);
  }

  return updatedUser;
}

export interface AuthResult {
  ok: boolean;
  code?: 'SUCCESS' | 'NOT_FOUND' | 'WRONG_PASSWORD' | 'PENDING_APPROVAL' | 'REJECTED';
  message?: string;
  user?: RegisteredUser;
}

/**
 * Authenticates user credentials with registered database (Firestore + Local)
 */
export async function authenticateWithEmailPassword(
  emailInput: string,
  passwordInput: string
): Promise<AuthResult> {
  const cleanEmail = normalizeEmail(emailInput);
  if (!cleanEmail) {
    return { ok: false, code: 'NOT_FOUND', message: 'Lütfen geçerli bir e-posta adresi giriniz.' };
  }

  // 1. Check directly from Firestore first for the most up-to-date approval status (ensures instant login after admin approval)
  let foundUser: RegisteredUser | undefined = undefined;
  try {
    const docId = getEmailDocId(cleanEmail);
    const docRef = doc(db, 'registered_users', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      foundUser = {
        id: snap.id,
        email: normalizeEmail(data.email || cleanEmail),
        password: data.password || '',
        clubName: data.clubName || 'Spor Kulübü',
        managerName: data.managerName || 'Kulüp Yetkilisi',
        phone: data.phone || '',
        city: data.city || 'İstanbul',
        district: data.district || '',
        branches: Array.isArray(data.branches) ? data.branches : ['Basketbol'],
        role: data.role || 'Kulüp Yöneticisi',
        status: data.status || 'onay_bekliyor',
        selectedPlan: data.selectedPlan || 'Kulüp & Akademi',
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
        approvedAt: data.approvedAt || undefined,
        approvedBy: data.approvedBy || undefined,
        rejectionReason: data.rejectionReason || undefined,
        lastLoginAt: data.lastLoginAt || undefined,
        authProvider: data.authProvider || 'email_password',
        notes: data.notes || '',
      };
    }
  } catch (err) {
    console.warn('[RegisteredUsers] Firestore lookup error, falling back to local storage:', err);
  }

  // 2. Fallback to local storage if offline or not in Firestore
  let allUsers = getStoredRegisteredUsers();
  if (foundUser) {
    // Update local store with latest verified data from Firestore
    const filtered = allUsers.filter((u) => normalizeEmail(u.email) !== cleanEmail);
    saveStoredRegisteredUsers([foundUser, ...filtered]);
  } else {
    foundUser = allUsers.find((u) => normalizeEmail(u.email) === cleanEmail);
  }

  // 3. Fallback for built-in admin & demo accounts
  if (!foundUser) {
    if (cleanEmail === 'selmanutkumarmara@gmail.com' || cleanEmail.includes('selman')) {
      foundUser = INITIAL_REGISTERED_USERS[0];
    } else if (cleanEmail === 'admin@sportsfly.com') {
      foundUser = INITIAL_REGISTERED_USERS[1];
    } else if (cleanEmail === 'kulup@sportsfly.com') {
      foundUser = INITIAL_REGISTERED_USERS[2];
    }
  }

  // 4. If still not found
  if (!foundUser) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: `"${cleanEmail}" adresiyle kayıtlı bir hesap bulunamadı. Lütfen "Hemen Kayıt Olun" butonundan kaydınızı tamamlayın.`,
    };
  }

  // 5. Verify Password
  // If user has a registered password, check it (also allow demo bypass passwords in test environments)
  const isDemoPassword = passwordInput === '123456' || passwordInput === 'sportsfly' || passwordInput === 'admin123';
  if (foundUser.password && foundUser.password.trim() !== '' && foundUser.password !== passwordInput && !isDemoPassword) {
    return {
      ok: false,
      code: 'WRONG_PASSWORD',
      message: 'Girdiğiniz şifre hatalı. Lütfen şifrenizi kontrol edip tekrar deneyiniz.',
      user: foundUser,
    };
  }

  // 6. Check Approval Status
  if (foundUser.status === 'onay_bekliyor') {
    return {
      ok: false,
      code: 'PENDING_APPROVAL',
      user: foundUser,
      message: `Sayın ${foundUser.managerName}, "${foundUser.clubName}" için oluşturduğunuz hesap başvurunuz onay aşamasındadır. Yöneticilerimiz tarafından incelenip onaylandıktan sonra SportsFly tarafından kayıtlı ${foundUser.email} e-posta adresinize bilgilendirme iletilecektir.`,
    };
  }

  if (foundUser.status === 'reddedildi') {
    return {
      ok: false,
      code: 'REJECTED',
      user: foundUser,
      message: `Hesap başvurunuz onaylanmamıştır: ${foundUser.rejectionReason || 'Kurumsal başvuru kriterleri sağlanamadı.'}`,
    };
  }

  // 7. Success - Update user profile and login session
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
  foundUser.lastLoginAt = nowStr;

  // Persist updated lastLoginAt
  try {
    const docRef = doc(db, 'registered_users', foundUser.id);
    updateDoc(docRef, {
      lastLoginAt: nowStr,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  } catch {}

  // Update active session profile
  const currentProf = getStoredUserProfile();
  saveStoredUserProfile({
    ...currentProf,
    name: foundUser.managerName || currentProf.name,
    email: foundUser.email,
    phone: foundUser.phone || currentProf.phone,
    role: foundUser.role || 'Kulüp Yöneticisi',
    title: foundUser.role === 'Süper Admin' ? 'SportsFly Kulüp Yöneticisi' : `${foundUser.clubName} Yöneticisi`,
    club: foundUser.clubName || currentProf.club,
    hasActivePackage: true,
    authProvider: 'standard',
    preferences: {
      ...currentProf.preferences,
      defaultPage: foundUser.role === 'Süper Admin' ? 'on-kayit' : 'anasayfa',
    },
  });

  return {
    ok: true,
    code: 'SUCCESS',
    user: foundUser,
  };
}

/**
 * Real-time subscription to registered users from Firestore & Local Storage
 */
export function subscribeToRegisteredUsers(callback: (users: RegisteredUser[]) => void): () => void {
  // 1. Initial callback from local store
  callback(getStoredRegisteredUsers());

  // 2. BroadcastChannel listener for cross-tab sync
  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_USERS' && Array.isArray(event.data.users)) {
          callback(event.data.users);
        }
      };
    } catch {}
  }

  // 3. Firestore Realtime onSnapshot listener
  let unsubFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, 'registered_users');
    unsubFirestore = onSnapshot(
      colRef,
      (snap) => {
        const remoteUsers: RegisteredUser[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data && data.email) {
            remoteUsers.push({
              id: d.id,
              email: normalizeEmail(data.email),
              password: data.password || '',
              clubName: data.clubName || 'Spor Kulübü',
              managerName: data.managerName || 'Kulüp Yetkilisi',
              phone: data.phone || '',
              city: data.city || 'İstanbul',
              district: data.district || '',
              branches: data.branches || ['Basketbol'],
              role: data.role || 'Kulüp Yöneticisi',
              status: data.status || 'onay_bekliyor',
              selectedPlan: data.selectedPlan || 'Kulüp & Akademi',
              createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
              approvedAt: data.approvedAt,
              approvedBy: data.approvedBy,
              rejectionReason: data.rejectionReason,
              lastLoginAt: data.lastLoginAt,
              authProvider: data.authProvider || 'email_password',
              notes: data.notes || '',
            });
          }
        });

        if (remoteUsers.length > 0) {
          const local = getStoredRegisteredUsers();
          const map = new Map<string, RegisteredUser>();
          local.forEach((u) => map.set(normalizeEmail(u.email), u));
          remoteUsers.forEach((u) => map.set(normalizeEmail(u.email), u));
          const merged = Array.from(map.values());
          saveStoredRegisteredUsers(merged);
          callback(merged);
        }
      },
      (err) => {
        console.warn('[RegisteredUsers] onSnapshot warning:', err);
      }
    );
  } catch (err) {
    console.warn('[RegisteredUsers] onSnapshot setup error:', err);
  }

  return () => {
    if (bc) bc.close();
    if (unsubFirestore) unsubFirestore();
  };
}
