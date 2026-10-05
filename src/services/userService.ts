import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { User, signInAnonymously, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ADMIN_GOOGLE_EMAIL, UserProfileData, getStoredUserProfile, saveStoredUserProfile } from '../data/userProfile';
import { registerOrUpdateGoogleLoginUser } from '../data/googleUsersAccess';
import { setActiveSessionPlan } from '../data/packagePermissions';

export interface PersistedUserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: string;
  clubName: string;
  hasActivePackage: boolean;
}

/**
 * Establishes an active Firebase Auth user session.
 * If already authenticated via Google popup or session, returns existing auth.currentUser.
 * Otherwise authenticates to Firebase Auth and updates profile metadata.
 */
export async function ensureFirebaseAuthSession(params: {
  email: string;
  displayName: string;
  photoURL?: string;
  uid?: string;
}): Promise<User | null> {
  try {
    if (auth.currentUser) {
      if (params.displayName && auth.currentUser.displayName !== params.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: params.displayName,
          photoURL: params.photoURL || undefined,
        }).catch(() => {});
      }
      return auth.currentUser;
    }

    // Authenticate with Firebase Auth to establish genuine auth token and isSignedIn() state
    const userCredential = await signInAnonymously(auth);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: params.displayName,
        photoURL: params.photoURL || undefined,
      }).catch(() => {});
      return userCredential.user;
    }
  } catch (err) {
    console.warn('[Firebase Auth] Session init warning:', err);
  }
  return auth.currentUser;
}

/**
 * Persists authenticated Firebase user profile into Firestore:
 * 1. /users/{uid} (Public profile)
 * 2. /users/{uid}/private/info (Private PII)
 * 3. /googleUsers/{uid} (Google users access control registry)
 */
export async function persistUserToFirestore(
  user: User | { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null; phoneNumber?: string | null },
  customProfile?: Partial<UserProfileData>
): Promise<PersistedUserRecord> {
  const uid = user.uid || `user-${Date.now()}`;
  const email = (user.email || customProfile?.email || '').trim().toLowerCase();
  const displayName = user.displayName || customProfile?.name || 'Google Kullanıcısı';
  const photoURL = user.photoURL || customProfile?.avatarUrl || null;
  const isAdmin = email === ADMIN_GOOGLE_EMAIL;

  const role = isAdmin ? 'Süper Admin' : (customProfile?.role || 'Google Kullanıcısı');
  const clubName = isAdmin
    ? 'SportsFly Kadıköy Merkez Şube'
    : (customProfile?.club || 'Paket Seçimi Bekleniyor');
  const hasActivePackage = isAdmin ? true : Boolean(customProfile?.hasActivePackage);

  const cleanUid = uid.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);

  // 1. Save or Update in /googleUsers/{uid} (Admin panel yetkilendirme listesi)
  try {
    const googleUserDocRef = doc(db, 'googleUsers', cleanUid);
    await setDoc(
      googleUserDocRef,
      {
        id: cleanUid,
        uid: cleanUid,
        name: displayName.slice(0, 120),
        email: email.slice(0, 160),
        avatarUrl: photoURL ? photoURL.slice(0, 500) : null,
        clubName: clubName.slice(0, 140),
        phone: (user.phoneNumber || customProfile?.phone || '+90 532 000 00 00').slice(0, 32),
        assignedPlan: isAdmin ? 'Pro Akademi & Çoklu Şube' : 'Paket Seçilmedi',
        allowedPages: isAdmin
          ? ['anasayfa', 'sporcular', 'gruplar', 'egitmenler', 'yoklama', 'sporcu-karnesi', 'on-muhasebe', 'paketler', 'yetkilendirmeler']
          : ['paketler'],
        isFullAccess: isAdmin,
        lastLoginAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firestore] googleUsers sync failed, continuing:', err);
  }

  // 2. Save public profile to /users/{uid}
  try {
    const userDocRef = doc(db, 'users', cleanUid);
    const existingSnap = await getDoc(userDocRef);
    const mappedRole = isAdmin ? 'kulup_yoneticisi' : 'sporcu';

    if (!existingSnap.exists()) {
      await setDoc(userDocRef, {
        uid: cleanUid,
        displayName: displayName.slice(0, 100),
        clubName: clubName.slice(0, 140),
        role: mappedRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingSnap.data();
      await setDoc(
        userDocRef,
        {
          uid: cleanUid,
          displayName: displayName.slice(0, 100),
          clubName: clubName.slice(0, 140),
          role: existingData?.role || mappedRole,
          createdAt: existingData?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[Firestore] /users public profile sync failed:', err);
  }

  // 3. Save private info to /users/{uid}/private/info
  try {
    const privateInfoRef = doc(db, 'users', cleanUid, 'private', 'info');
    await setDoc(
      privateInfoRef,
      {
        ownerId: cleanUid,
        email: email.slice(0, 160),
        phone: (user.phoneNumber || customProfile?.phone || '+90 532 000 00 00').slice(0, 32),
        kvkkConsentAccepted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firestore] /users private info sync failed:', err);
  }

  // 4. Update local registry and stored profile
  const currentProf = getStoredUserProfile();
  saveStoredUserProfile({
    ...currentProf,
    name: displayName,
    email: email,
    avatarUrl: photoURL || undefined,
    role: role,
    title: isAdmin ? 'SportsFly Kulüp Yöneticisi' : 'Google Hesabı',
    club: clubName,
    authProvider: 'google',
    hasActivePackage: hasActivePackage,
    preferences: {
      ...currentProf.preferences,
      defaultPage: isAdmin ? 'anasayfa' : 'paketler',
    },
  });

  registerOrUpdateGoogleLoginUser({
    uid: cleanUid,
    name: displayName,
    email: email,
    avatarUrl: photoURL || undefined,
    clubName,
  });

  return {
    uid: cleanUid,
    email,
    displayName,
    photoURL,
    role,
    clubName,
    hasActivePackage,
  };
}

/**
 * Syncs Google profile data with Firebase Auth, Firestore, and localStorage.
 */
export async function syncGoogleProfileData(
  googleEmail: string,
  displayName: string,
  photoURL?: string,
  uid?: string,
  firebaseUserInstance?: User
): Promise<PersistedUserRecord> {
  const cleanEmail = (googleEmail || '').trim().toLowerCase();
  const isAdminAccount = cleanEmail === ADMIN_GOOGLE_EMAIL;

  // 1. Establish/Link Firebase Auth user session
  let activeAuthUser = firebaseUserInstance || auth.currentUser;
  if (!activeAuthUser) {
    activeAuthUser = await ensureFirebaseAuthSession({
      email: cleanEmail,
      displayName: displayName || (isAdminAccount ? 'Selman Utku' : 'Google Kullanıcısı'),
      photoURL,
      uid,
    });
  }

  // 2. Persist to Firestore
  const persistedRecord = await persistUserToFirestore(
    activeAuthUser || {
      uid: uid || `google-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName || (isAdminAccount ? 'Selman Utku' : 'Google Kullanıcısı'),
      photoURL: photoURL || null,
    },
    {
      email: cleanEmail,
      name: displayName || (isAdminAccount ? 'Selman Utku' : 'Google Kullanıcısı'),
      avatarUrl: photoURL || undefined,
      role: isAdminAccount ? 'Süper Admin' : 'Google Kullanıcısı',
      club: isAdminAccount ? 'SportsFly Kadıköy Merkez Şube' : 'Paket Seçimi Bekleniyor',
      hasActivePackage: isAdminAccount,
    }
  );

  return persistedRecord;
}

/**
 * Loads user profile from Firestore if available
 */
export async function loadUserFromFirestore(uid: string): Promise<Partial<UserProfileData> | null> {
  try {
    const cleanUid = uid.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
    const userDocRef = doc(db, 'users', cleanUid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        name: data.displayName,
        club: data.clubName,
      };
    }
  } catch (err) {
    console.warn('[Firestore] loadUserFromFirestore error:', err);
  }
  return null;
}
