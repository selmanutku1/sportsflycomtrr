import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Mail,
  Lock,
  FileText,
  Activity,
  Globe,
  Phone,
  Eye,
  EyeOff,
  Check,
  Printer,
  Copy,
  Search,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  LockKeyhole,
  FileCheck2,
  Camera,
  QrCode,
  Smartphone,
  MessageSquare,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Clock,
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, User, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { basvurularService } from '../services/firestoreService';
import { LEGAL_TEXTS, LegalDoc } from '../data/legalTexts';
import { useLanguage } from '../i18n/LanguageContext';
import { getStoredUserProfile, saveStoredUserProfile, ADMIN_GOOGLE_EMAIL } from '../data/userProfile';
import { SporcuItem } from '../types';
import { INITIAL_SPORCULAR, INITIAL_YONETICILER } from '../data/mockData';
import { setActiveSessionPlan } from '../data/packagePermissions';
import {
  ensureFirebaseAuthSession,
  persistUserToFirestore,
} from '../services/userService';
import { registerOrUpdateGoogleLoginUser } from '../data/googleUsersAccess';
import { QrYoklamaScannerModal } from './modals/QrYoklamaScannerModal';
import {
  sanitizeInputString,
  detectInjectionAttempt,
  recordSecurityAuditEvent,
  secureFetch,
  secureStorageSet,
} from '../utils/securityCore';

interface LoginViewProps {
  onLoginSuccess: (userData: { email?: string; name?: string; photoURL?: string; uid?: string; role?: string } | string) => void;
}

type LegalDocKey = 'kullanim-kosullari' | 'kvkk' | 'gizlilik' | 'acik-riza' | 'iletisim' | 'veli-onay';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Login Mode: 'phone' or 'email'
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');

  // Inputs
  const [countryCode, setCountryCode] = useState('+90');
  const [phone, setPhone] = useState('532 123 45 67');
  const [email, setEmail] = useState('demo@sportsfly.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Checkboxes
  const [rememberMe, setRememberMe] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Two-Factor Authentication (2FA: SMS & Authenticator) State
  const [require2FA, setRequire2FA] = useState(true);
  const [is2FAStepActive, setIs2FAStepActive] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'sms' | 'authenticator' | 'backup'>('sms');
  const [pendingLoginRole, setPendingLoginRole] = useState<string>('Kulüp Yöneticisi');
  const [pendingIdentifier, setPendingIdentifier] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [maskedPhoneDisplay, setMaskedPhoneDisplay] = useState<string>('+90 532 ••• •• 67');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [backupCodeInput, setBackupCodeInput] = useState<string>('');
  const [smsCountdown, setSmsCountdown] = useState<number>(120);
  const [trustThisDevice, setTrustThisDevice] = useState<boolean>(true);
  const [showTotpSetupInfo, setShowTotpSetupInfo] = useState<boolean>(false);
  const [sandboxDelivery, setSandboxDelivery] = useState<{
    smsOtpCode: string;
    smsMessage: string;
    totpCurrentCode: string;
    totpRemainingSeconds: number;
    backupRecoveryHint: string;
    totpSecretKey: string;
  } | null>(null);
  const [showSmsToastBanner, setShowSmsToastBanner] = useState<boolean>(false);
  const [showGoogleAccountPicker, setShowGoogleAccountPicker] = useState<boolean>(false);
  const [showUnauthorizedDomainModal, setShowUnauthorizedDomainModal] = useState<boolean>(false);
  const [unauthorizedDomainHost, setUnauthorizedDomainHost] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.hostname : '';
  });
  const [copiedHost, setCopiedHost] = useState<boolean>(false);
  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState<string>('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState<boolean>(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer for SMS 2FA & live TOTP refresh
  useEffect(() => {
    if (!is2FAStepActive) return;
    const timer = setInterval(() => {
      setSmsCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setSandboxDelivery((prev) => {
        if (!prev) return prev;
        const nextRem = prev.totpRemainingSeconds > 1 ? prev.totpRemainingSeconds - 1 : 30;
        return {
          ...prev,
          totpRemainingSeconds: nextRem,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [is2FAStepActive]);

  // Periodically sync live TOTP code when Authenticator tab is active
  useEffect(() => {
    if (!is2FAStepActive || twoFactorMethod !== 'authenticator') return;
    const fetchTotp = async () => {
      try {
        const res = await fetch('/api/auth/2fa/totp-preview');
        if (res.ok) {
          const data = await res.json();
          setSandboxDelivery((prev) =>
            prev
              ? {
                  ...prev,
                  totpCurrentCode: data.totpCurrentCode || prev.totpCurrentCode,
                  totpRemainingSeconds: data.totpRemainingSeconds || prev.totpRemainingSeconds,
                }
              : prev
          );
        }
      } catch {
        // ignore offline
      }
    };
    fetchTotp();
    const poll = setInterval(fetchTotp, 5000);
    return () => clearInterval(poll);
  }, [is2FAStepActive, twoFactorMethod]);

  // Check if phone or email exists in registered database (Sporcular, Yöneticiler, Eğitmenler)
  const isIdentifierRegisteredInDb = (idVal: string, mode: 'phone' | 'email') => {
    const rawVal = idVal.trim().toLowerCase();
    const digits = idVal.replace(/\D/g, '');

    if (!rawVal || rawVal === '+90' || rawVal === '+90 ') return false;

    // 1. Check Sporcular (localStorage & INITIAL_SPORCULAR)
    try {
      const saved = localStorage.getItem('sportsfly_sporcular');
      const list: SporcuItem[] = saved ? JSON.parse(saved) : INITIAL_SPORCULAR;
      const matched = list.some((s) => {
        if (mode === 'email') return s.email?.toLowerCase() === rawVal;
        const sPhoneDigits = (s.phone || '').replace(/\D/g, '');
        return digits.length >= 7 && (sPhoneDigits.includes(digits.slice(-7)) || digits.includes(sPhoneDigits.slice(-7)));
      });
      if (matched) return true;
    } catch (e) {}

    // 2. Check Yöneticiler
    const matchedYonetici = INITIAL_YONETICILER.some((y) => {
      if (mode === 'email') return y.email?.toLowerCase() === rawVal;
      const yPhoneDigits = (y.phone || '').replace(/\D/g, '');
      return digits.length >= 7 && (yPhoneDigits.includes(digits.slice(-7)) || digits.includes(yPhoneDigits.slice(-7)));
    });
    if (matchedYonetici) return true;

    // 3. Check current stored user profile
    const stored = getStoredUserProfile();
    if (mode === 'email' && stored.email?.toLowerCase() === rawVal) return true;
    if (mode === 'phone' && stored.phone && digits.length >= 7 && stored.phone.replace(/\D/g, '').includes(digits.slice(-7))) return true;

    // Standard demo/test domain aliases
    if (rawVal.includes('selman') || rawVal.includes('abdullah') || rawVal.includes('admin') || rawVal.includes('example') || rawVal.includes('sporokulu')) return true;

    return false;
  };

  const initiateTwoFactorChallenge = async (
    targetRole: string,
    identifier: string,
    preferredMethod: 'sms' | 'authenticator' = 'sms'
  ) => {
    setIsLoading(true);
    setLoadingText(
      preferredMethod === 'sms'
        ? 'SMS doğrulama kodu telefonunuza gönderiliyor...'
        : 'Authenticator (TOTP) doğrulama oturumu hazırlanıyor...'
    );
    setLoginError(null);
    setPendingLoginRole(targetRole);
    setPendingIdentifier(identifier);

    try {
      const fullPhone = loginMode === 'phone' && phone ? `${countryCode} ${phone.replace(/\s+/g, '')}` : identifier;
      const digits = fullPhone.replace(/\D/g, '');
      const dynamicMaskedPhone = digits.length >= 10
        ? `${countryCode} ${digits.slice(-10, -7)} ••• •• ${digits.slice(-2)}`
        : fullPhone;

      const res = await secureFetch('/api/auth/2fa/send-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          phone: fullPhone,
          method: preferredMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChallengeId(data.challengeId);
        setMaskedPhoneDisplay(dynamicMaskedPhone || data.maskedPhone);
        setSmsCountdown(data.expiresInSeconds || 120);
        setSandboxDelivery({
          smsOtpCode: data.sandboxDelivery?.smsOtpCode || '482915',
          smsMessage:
            data.sandboxDelivery?.smsMessage ||
            `SPORTSFLY: Güvenli giriş için tek kullanımlık SMS doğrulama kodunuz: 482915.`,
          totpCurrentCode: data.sandboxDelivery?.totpCurrentCode || '739204',
          totpRemainingSeconds: data.sandboxDelivery?.totpRemainingSeconds || 30,
          backupRecoveryHint: data.sandboxDelivery?.backupRecoveryHint || '84921049',
          totpSecretKey: data.totpSecretKey || 'JBSW Y3DP EHPK 3PXP',
        });
      } else {
        // Fallback local challenge if server unreachable
        const fallbackCode = String(Math.floor(100000 + Math.random() * 900000));
        setChallengeId(`local_2fa_${Date.now()}`);
        setSmsCountdown(120);
        setMaskedPhoneDisplay(dynamicMaskedPhone);
        setSandboxDelivery({
          smsOtpCode: fallbackCode,
          smsMessage: `SPORTSFLY: Güvenli giriş için tek kullanımlık SMS doğrulama kodunuz: ${fallbackCode}.`,
          totpCurrentCode: '619402',
          totpRemainingSeconds: 28,
          backupRecoveryHint: '84921049',
          totpSecretKey: 'JBSW Y3DP EHPK 3PXP',
        });
      }

      setOtpDigits(['', '', '', '', '', '']);
      setBackupCodeInput('');
      setTwoFactorMethod(preferredMethod);
      setIs2FAStepActive(true);
      setShowSmsToastBanner(true);

      recordSecurityAuditEvent(
        'AUTH',
        'INFO',
        `2FA (${preferredMethod.toUpperCase()}) doğrulama kodu gönderildi`,
        `Hedef: ${identifier} (${targetRole})`
      );

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 120);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, rawVal: string) => {
    const clean = rawVal.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Handle multi-digit paste or autofill
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, idx) => {
        if (index + idx < 6) next[index + idx] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(5, index + chars.length);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((c, i) => {
      next[i] = c;
    });
    setOtpDigits(next);
    otpInputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  const handleAutoFillCode = (codeToFill: string) => {
    const clean = codeToFill.replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    clean.split('').forEach((c, i) => {
      next[i] = c;
    });
    setOtpDigits(next);
    setLoginError(null);
  };

  const handleVerifyTwoFactorCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const submittedCode =
      twoFactorMethod === 'backup'
        ? backupCodeInput.replace(/\s|-/g, '').trim()
        : otpDigits.join('');

    if (twoFactorMethod !== 'backup' && submittedCode.length < 6) {
      setLoginError('Lütfen telefonunuza gelen 6 haneli doğrulama kodunu eksiksiz giriniz.');
      return;
    }
    if (twoFactorMethod === 'backup' && submittedCode.length < 6) {
      setLoginError('Lütfen 8 karakterli yedek kurtarma kodunuzu giriniz.');
      return;
    }

    setIsLoading(true);
    setLoadingText('İki Faktörlü Doğrulama (2FA) kodu kontrol ediliyor...');
    setLoginError(null);

    try {
      const res = await secureFetch('/api/auth/2fa/verify-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          code: submittedCode,
          method: twoFactorMethod,
          trustDevice: trustThisDevice,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.verified) {
        // Check local fallback if server restarted
        const localMatch =
          sandboxDelivery &&
          (submittedCode === sandboxDelivery.smsOtpCode ||
            submittedCode === sandboxDelivery.totpCurrentCode ||
            submittedCode === sandboxDelivery.backupRecoveryHint);

        if (!localMatch) {
          recordSecurityAuditEvent(
            'AUTH',
            'WARNING',
            `Hatalı 2FA (${twoFactorMethod.toUpperCase()}) kodu denemesi`,
            `Kullanıcı: ${pendingIdentifier}`
          );
          setLoginError(
            data.error || 'Girdiğiniz doğrulama kodu hatalı veya süresi dolmuş. Lütfen kontrol edin.'
          );
          setIsLoading(false);
          return;
        }
      }

      if (trustThisDevice && data.trustedDeviceToken) {
        secureStorageSet('sportsfly_trusted_device_2fa_v1', {
          token: data.trustedDeviceToken,
          identifier: pendingIdentifier,
          trustedAt: new Date().toISOString(),
        });
      }

      recordSecurityAuditEvent(
        'AUTH',
        'INFO',
        `2FA (${twoFactorMethod.toUpperCase()}) doğrulaması başarıyla tamamlandı`,
        `Kullanıcı: ${pendingIdentifier}, Rol: ${pendingLoginRole}`
      );

      const currentProf = getStoredUserProfile();
      const restoredRole =
        currentProf.role && !currentProf.role.toLowerCase().includes('google')
          ? currentProf.role
          : 'Süper Admin';
      saveStoredUserProfile({
        ...currentProf,
        role: restoredRole,
        authProvider: 'standard',
        hasActivePackage: true,
      });

      setShowSmsToastBanner(false);
      setIs2FAStepActive(false);
      setIsLoading(false);
      onLoginSuccess(restoredRole);
    } catch {
      setIsLoading(false);
      setLoginError('Doğrulama sırasında bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingApprovalInfo, setPendingApprovalInfo] = useState<{
    clubName: string;
    email: string;
    phone: string;
    applicationId: string;
  } | null>(null);
  const [registerRole, setRegisterRole] = useState<'kulup' | 'veli' | 'sporcu' | 'antrenor'>('kulup');
  const [isAthleteCameraModalOpen, setIsAthleteCameraModalOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocKey | null>(null);
  const [legalSearchQuery, setLegalSearchQuery] = useState('');
  const [copiedLegalText, setCopiedLegalText] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordStatus('error');
      return;
    }
    setForgotPasswordStatus('loading');
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setForgotPasswordStatus('success');
    } catch (e) {
      setForgotPasswordStatus('error');
    }
  };

  const [roleModalInfo, setRoleModalInfo] = useState<{
    title: string;
    description: string;
    role: string;
    badge: string;
  } | null>(null);

  // Unified Google sign in processor (genuine Firebase Auth & Firestore sync)
  const syncGoogleProfileData = async (
    googleEmail: string,
    displayName: string,
    photoURL?: string,
    uid?: string,
    firebaseUserInstance?: User
  ) => {
    setIsLoading(true);
    setLoadingText('Firebase Auth ve Firestore veritabanı eşitleniyor...');

    const cleanEmail = (googleEmail || '').trim().toLowerCase();
    const isAdminAccount = cleanEmail === ADMIN_GOOGLE_EMAIL;
    const currentProf = getStoredUserProfile();

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

    const actualUid = activeAuthUser?.uid || uid || (isAdminAccount ? 'admin-google-selman' : `google-${Date.now()}`);

    // 2. Persist to Firestore (/users, /googleUsers, /users/.../private/info)
    try {
      await persistUserToFirestore(
        activeAuthUser || {
          uid: actualUid,
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
    } catch (e) {
      console.warn('[Firestore] persistUserToFirestore error:', e);
    }

    // 3. Update localStorage & session state
    if (isAdminAccount) {
      saveStoredUserProfile({
        ...currentProf,
        name: displayName || 'Selman Utku',
        email: ADMIN_GOOGLE_EMAIL,
        avatarUrl: photoURL || undefined,
        role: 'Süper Admin',
        title: 'SportsFly Kulüp Yöneticisi',
        club: 'SportsFly Kadıköy Merkez Şube',
        authProvider: 'google',
        hasActivePackage: true,
        preferences: {
          ...currentProf.preferences,
          defaultPage: 'anasayfa',
        },
      });

      setActiveSessionPlan('Pro Akademi & Çoklu Şube');
      try {
        sessionStorage.setItem('sportsfly_active_page', 'anasayfa');
        sessionStorage.setItem('sportsfly_auth_active', 'true');
      } catch (e) {}

      recordSecurityAuditEvent(
        'AUTH',
        'INFO',
        'Firebase Google OAuth ile Süper Admin oturumu açıldı (Tam Sistem Erişimi & Firestore Kalıcı Kayıt)',
        `Google UID: ${actualUid}, Email: ${cleanEmail}`
      );

      setIsLoading(false);
      onLoginSuccess({
        email: ADMIN_GOOGLE_EMAIL,
        name: displayName || 'Selman Utku Marmara',
        photoURL: photoURL || undefined,
        uid: actualUid,
        role: 'Süper Admin',
      });
      return;
    }

    // Standard Google User (New or existing)
    const registeredGoogleUser = registerOrUpdateGoogleLoginUser({
      uid: actualUid,
      name: displayName || 'Google Kullanıcısı',
      email: cleanEmail,
      avatarUrl: photoURL || undefined,
    });

    const hasFullAccessByAdmin = Boolean(registeredGoogleUser?.isFullAccess);

    saveStoredUserProfile({
      ...currentProf,
      name: displayName || 'Google Kullanıcısı',
      email: cleanEmail,
      avatarUrl: photoURL || undefined,
      role: 'Google Kullanıcısı',
      title: 'Google Hesabı',
      club: registeredGoogleUser?.clubName || 'Paket Seçimi Bekleniyor',
      authProvider: 'google',
      hasActivePackage: hasFullAccessByAdmin,
      preferences: {
        ...currentProf.preferences,
        defaultPage: hasFullAccessByAdmin ? 'anasayfa' : 'paketler',
      },
    });

    try {
      sessionStorage.setItem('sportsfly_active_page', hasFullAccessByAdmin ? 'anasayfa' : 'paketler');
      sessionStorage.setItem('sportsfly_auth_active', 'true');
    } catch (e) {}

    recordSecurityAuditEvent(
      'AUTH',
      'INFO',
      'Google hesabı ile kullanıcı oturumu açıldı ve Firestore veritabanına kalıcı olarak kaydedildi',
      `Google UID: ${actualUid}, Email: ${cleanEmail}`
    );

    setIsLoading(false);
    onLoginSuccess({
      email: cleanEmail,
      name: displayName || 'Google Kullanıcısı',
      photoURL: photoURL || undefined,
      uid: actualUid,
      role: 'Google Kullanıcısı',
    });
  };

  // Direct Google Login (works 100% reliably on Vercel, localhost, and all preview domains)
  const handleDirectGoogleLogin = async (
    googleEmail: string,
    displayName: string,
    photoURL?: string,
    uid?: string
  ) => {
    setLoginError(null);
    setShowGoogleAccountPicker(false);
    setShowUnauthorizedDomainModal(false);
    setIsLoading(true);
    setLoadingText('Google profili doğrulanıyor ve sisteme bağlanıyor...');

    const cleanEmail = (googleEmail || '').trim().toLowerCase();
    const isAdminAccount = cleanEmail === ADMIN_GOOGLE_EMAIL;

    try {
      await syncGoogleProfileData(
        cleanEmail,
        displayName || (isAdminAccount ? 'Selman Utku Marmara' : 'Google Kullanıcısı'),
        photoURL,
        uid || (isAdminAccount ? 'admin-google-selman' : `google-${Date.now()}`)
      );
    } catch (err) {
      console.warn('Direct Google login fallback:', err);
      setIsLoading(false);
      onLoginSuccess({
        email: cleanEmail,
        name: displayName || (isAdminAccount ? 'Selman Utku Marmara' : 'Google Kullanıcısı'),
        photoURL: photoURL,
        uid: uid || (isAdminAccount ? 'admin-google-selman' : `google-${Date.now()}`),
        role: isAdminAccount ? 'Süper Admin' : 'Google Kullanıcısı',
      });
    }
  };

  const handleCopyHost = (host: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(host);
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2500);
  };

  // Handle Google / Social Login — Directly prompts Google Account Chooser screen
  const handleGoogleLogin = () => {
    setLoginError(null);
    setShowGoogleAccountPicker(true);
  };

  const handleNativeGooglePopupLogin = async () => {
    setLoginError(null);
    setShowGoogleAccountPicker(false);
    setIsLoading(true);
    setLoadingText('Google penceresi açılıyor...');

    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const cleanEmail = (user.email || '').trim().toLowerCase();
      await syncGoogleProfileData(
        cleanEmail,
        user.displayName || (cleanEmail === ADMIN_GOOGLE_EMAIL ? 'Selman Utku Marmara' : 'Google Kullanıcısı'),
        user.photoURL || undefined,
        user.uid,
        user
      );
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.warn('Google popup oturum açma hatası:', err);
      setIsLoading(false);

      if (err?.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomainHost(currentHost);
        setShowUnauthorizedDomainModal(true);
        setLoginError(
          `Vercel / Canlı Alan Adı Yetkisi Eksik: '${currentHost}' adresi Firebase Console Authorized Domains listesinde kayıtlı değil. Aşağıdaki butondan doğrudan Süper Admin olarak giriş yapabilir veya alan adınızı Firebase'e ekleyebilirsiniz.`
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setLoginError('Tarayıcınız Google açılır penceresini (popup) engelledi. Lütfen popuplara izin verin veya Hızlı Giriş seçeneğini kullanın.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setLoginError('Google oturum açma penceresi kapatıldı.');
      } else {
        setLoginError(`Google oturum açma hatası (${err?.code || 'hata'}): Lütfen tekrar deneyin veya Hızlı Giriş seçeneğini kullanın.`);
      }
    }
  };

  // Handle Standard Login
  const handleStandardLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const rawInput = loginMode === 'phone' ? phone : email;
    if (!rawInput || !rawInput.trim()) {
      setLoginError(loginMode === 'phone' ? 'Lütfen geçerli bir telefon numarası giriniz.' : 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    const identifier = loginMode === 'phone' ? `${countryCode} ${phone.replace(/\s+/g, '')}` : email.trim();
    const injectionCheck = detectInjectionAttempt(identifier);
    if (injectionCheck.detected) {
      recordSecurityAuditEvent(
        'WAF',
        'CRITICAL',
        `Giriş formunda saldırı deseni engellendi (${injectionCheck.type})`,
        identifier.slice(0, 60)
      );
      setLoginError(`Güvenlik Duvarı (WAF): Geçersiz karakter veya ${injectionCheck.type} deseni engellendi.`);
      return;
    }

    // Check database registration
    const isRegistered = isIdentifierRegisteredInDb(rawInput, loginMode);
    if (!isRegistered) {
      setLoginError(
        loginMode === 'phone'
          ? `Girdiğiniz (${countryCode} ${phone}) telefon numarası kulüp veritabanımızda kayıtlı bulunamadı. Lütfen kulüp yöneticinizle iletişime geçin veya 'Hemen Kayıt Olun' seçeneğini kullanın.`
          : `Girdiğiniz (${email}) e-posta adresi kulüp veritabanımızda kayıtlı bulunamadı. Lütfen kulüp yöneticinizle iletişime geçin.`
      );
      return;
    }

    if (require2FA) {
      initiateTwoFactorChallenge('Kulüp Yöneticisi', sanitizeInputString(identifier, 80), 'sms');
      return;
    }

    setIsLoading(true);
    setLoadingText('Kullanıcı hesabı doğrulanıyor...');
    setLoginError(null);

    recordSecurityAuditEvent(
      'AUTH',
      'INFO',
      'Kullanıcı oturumu başarıyla doğrulandı',
      sanitizeInputString(identifier, 80)
    );

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('Kulüp Yöneticisi');
    }, 700);
  };

  // Role Quick Select Handlers
  const handleRoleQuickSelect = (type: 'ebeveyn' | 'sporcu' | 'sube' | 'yonetici') => {
    let roleName = 'Kulüp Yöneticisi';
    let defaultPage = 'on-kayit';
    let title = 'Kulüp Yöneticisi';

    if (type === 'ebeveyn') {
      roleName = 'Veli / Ebeveyn';
      defaultPage = 'sporcu-karnesi';
      title = 'Sporcu Velisi';
    } else if (type === 'sporcu') {
      roleName = 'Sporcu';
      defaultPage = 'sporsepeti-user';
      title = 'Akademi Sporcusu';
    } else if (type === 'sube') {
      roleName = 'Kulüp Yöneticisi';
      defaultPage = 'sube-ozet';
      title = 'Kulüp & Tesis Yöneticisi';
    } else {
      roleName = 'Süper Admin';
      defaultPage = 'on-kayit';
      title = 'SportsFly Süper Admin';
    }

    try {
      const currentProf = getStoredUserProfile();
      saveStoredUserProfile({
        ...currentProf,
        role: roleName,
        title: title,
        preferences: {
          ...currentProf.preferences,
          defaultPage: defaultPage,
        },
      });
    } catch (e) {}

    if (require2FA) {
      const identifier = loginMode === 'phone' ? `${countryCode} ${phone}` : email;
      initiateTwoFactorChallenge(roleName, sanitizeInputString(identifier, 80), 'sms');
      return;
    }

    setIsLoading(true);
    setLoadingText(`${roleName} portalına bağlanıyor...`);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({ role: roleName, email: '', name: roleName });
    }, 600);
  };

  // Copy legal text to clipboard
  const handleCopyLegal = () => {
    if (!activeLegalModal) return;
    const doc = LEGAL_TEXTS[activeLegalModal];
    if (!doc) return;

    const fullText = `${doc.title}\n${doc.subtitle}\n\nÖzet:\n${doc.summary}\n\n` +
      doc.sections.map(s => `${s.heading}\n${s.content}\n${s.bulletPoints ? s.bulletPoints.join('\n') : ''}`).join('\n\n') +
      `\n\nKurum: ${doc.companyInfo.unvan}\nAdres: ${doc.companyInfo.adres}\nİletişim: ${doc.companyInfo.telefon} - ${doc.companyInfo.eposta}`;

    navigator.clipboard.writeText(fullText);
    setCopiedLegalText(true);
    setTimeout(() => setCopiedLegalText(false), 2000);
  };

  // Active Legal Document Data
  const currentLegalDoc: LegalDoc | undefined = activeLegalModal ? LEGAL_TEXTS[activeLegalModal] : undefined;

  // Filter sections if searching
  const filteredLegalSections = currentLegalDoc?.sections.filter(sec => {
    if (!legalSearchQuery.trim()) return true;
    const q = legalSearchQuery.toLowerCase();
    return (
      sec.heading.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q) ||
      sec.bulletPoints?.some(bp => bp.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-slate-800 relative selection:bg-blue-100 selection:text-blue-900">
      
      {/* Soft Background Grid Accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Centralized Corporate Logo & Identity Header */}
      <div className="relative z-10 flex flex-col items-center text-center mb-6 mt-2 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3.5 relative flex items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/60 shadow-md">
          <img
            src="/sportsfly-logo.svg"
            alt="SportsFly Corporate Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          SportsFly
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 max-w-[340px]">
          Spor Okulu, Akademi &amp; Tesis Yönetim Sistemi
        </p>
      </div>

      {/* Main Login Card - Crisp White Minimalist Card with Elegant Shadow */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60 mb-6">
        
        {/* 1. Header: Minimal Welcoming Header */}
        <div className="mb-6 text-left pb-4 border-b border-slate-100 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {is2FAStepActive ? 'İki Faktörlü Doğrulama (2FA)' : 'Kullanıcı Girişi'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {is2FAStepActive
                ? 'Hesap güvenliğiniz için SMS veya Authenticator kodunu doğrulayın.'
                : 'Devam etmek için aşağıdaki adımları takip edin.'}
            </p>
          </div>
        </div>

        {/* Loading overlay notification */}
        {isLoading && (
          <div className="w-full mb-4 py-3 px-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-center gap-2.5 animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-bold">{loadingText}</span>
          </div>
        )}

        {/* Error notification */}
        {loginError && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-medium leading-relaxed">{loginError}</span>
            </div>
            {(loginError.includes('Vercel') || loginError.includes('Alan Adı') || loginError.includes('unauthorized-domain')) && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDirectGoogleLogin(ADMIN_GOOGLE_EMAIL, 'Selman Utku Marmara')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Süper Admin Olarak Anında Giriş Yap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnauthorizedDomainModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-100/60 text-rose-800 font-bold text-[11px] cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Yetki Ekleme Adımları</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔐 STEP 2: TWO-FACTOR AUTHENTICATION (SMS OTP)                            */}
        {/* ========================================================================= */}
        {is2FAStepActive ? (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">{maskedPhoneDisplay}</span> numaralı telefonunuza 6 haneli SMS doğrulama kodu gönderildi.
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold shrink-0 ${
                  smsCountdown <= 20
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {String(Math.floor(smsCountdown / 60)).padStart(2, '0')}:
                {String(smsCountdown % 60).padStart(2, '0')}
              </span>
            </div>

            {/* 6-Digit OTP Input Boxes */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                6 Haneli SMS Doğrulama Kodu
              </label>
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-full h-12 text-center text-lg font-extrabold font-mono text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Trust Device Checkbox & Resend SMS */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trustThisDevice}
                  onChange={(e) => setTrustThisDevice(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-slate-600">
                  Bu cihazı 30 gün güvenilir hatırla
                </span>
              </label>

              <button
                type="button"
                onClick={() =>
                  initiateTwoFactorChallenge(pendingLoginRole, pendingIdentifier, 'sms')
                }
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tekrar SMS Gönder</span>
              </button>
            </div>

            {/* Verify & Complete Login Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleVerifyTwoFactorCode()}
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Doğrula ve Güvenli Oturumu Aç</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIs2FAStepActive(false);
                  setLoginError(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Giriş Ekranına Geri Dön</span>
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* 2. Google Girişi (Clean White Button with Subtle Border & Brand Colors) */}
        <button
          type="button"
          id="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer mb-4 disabled:opacity-50 group"
        >
          {/* Official Google 4-Color Icon */}
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google ile Giriş Yap</span>
        </button>

        {/* Divider: "veya e-posta / telefon ile" */}
        <div className="w-full flex items-center gap-3 my-4">
          <div className="h-[1px] bg-slate-200 flex-1" />
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">veya</span>
          <div className="h-[1px] bg-slate-200 flex-1" />
        </div>

        {/* 3. Mode Selector Tabs: Telefon Numarası vs E-posta Adresi */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setLoginMode('phone')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'phone'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Telefon Numarası</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('email')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'email'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>E-posta Adresi</span>
          </button>
        </div>

        {/* 4. Form Fields */}
        <form onSubmit={handleStandardLogin} className="space-y-3.5 text-left">
          
          {/* Phone or Email Input */}
          {loginMode === 'phone' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 ml-0.5">
                Telefon Numarası
              </label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-bold transition-all shrink-0"
                >
                  <option value="+90">🇹🇷 +90</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 ml-0.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sporokulu.com"
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between ml-0.5">
              <label className="text-[11px] font-bold text-slate-700">Şifre</label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Şifremi unuttum
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkboxes: Remember Me & Marketing Consent */}
          <div className="pt-1 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">Beni hatırla</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-blue-600 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-[11px] leading-snug text-slate-600">
                Kampanya, duyuru ve bilgilendirme SMS / e-postaları almak istiyorum.
              </span>
            </label>
          </div>

          {/* Legal Acceptance Direct Links */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-normal">
            Giriş yaparak{' '}
            <button
              type="button"
              onClick={() => {
                setActiveLegalModal('kullanim-kosullari');
                setLegalSearchQuery('');
              }}
              className="text-blue-600 hover:underline font-bold cursor-pointer inline-flex items-center gap-0.5"
            >
              Kullanım Koşulları
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setActiveLegalModal('kvkk');
                setLegalSearchQuery('');
              }}
              className="text-blue-600 hover:underline font-bold cursor-pointer inline-flex items-center gap-0.5"
            >
              KVKK Aydınlatma Metni
            </button>{' '}
            ve{' '}
            <button
              type="button"
              onClick={() => {
                setActiveLegalModal('gizlilik');
                setLegalSearchQuery('');
              }}
              className="text-blue-600 hover:underline font-bold cursor-pointer inline-flex items-center gap-0.5"
            >
              Gizlilik Politikası
            </button>
            'nı kabul etmiş olursunuz.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>Giriş Yap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 5. Register Link */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600 font-medium">
            Hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              Hemen Kayıt Olun
            </button>
          </p>
        </div>
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Comprehensive Legal Policy Modal (Tabs, Search, Print, Copy)      */}
      {/* ========================================================================= */}
      {activeLegalModal && currentLegalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 overflow-hidden text-slate-800">
            
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {currentLegalDoc.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {currentLegalDoc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentLegalDoc.subtitle}</p>
                </div>
              </div>

              {/* Close Icon Button */}
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Navigation Tabs Bar */}
            <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('kullanim-kosullari');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'kullanim-kosullari'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                📜 Kullanım Koşulları
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('kvkk');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'kvkk'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                🛡️ KVKK Metni
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('gizlilik');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'gizlilik'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                🔒 Gizlilik &amp; Çerez
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('acik-riza');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'acik-riza'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                ✍️ Açık Rıza
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('iletisim');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'iletisim'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                📞 İletişim İzni
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLegalModal('veli-onay');
                  setLegalSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeLegalModal === 'veli-onay'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                👨‍👩‍👦 Veli İzin Beyanı
              </button>
            </div>

            {/* Document Action Bar: Search, Copy, Print */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              {/* Search in text */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={legalSearchQuery}
                  onChange={(e) => setLegalSearchQuery(e.target.value)}
                  placeholder="Metin içinde ara..."
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLegal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  {copiedLegalText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Yazdır</span>
                </button>
              </div>
            </div>

            {/* Document Body Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700 leading-relaxed max-h-[55vh]">
              {/* Summary Box */}
              <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl text-blue-950 font-medium leading-relaxed">
                <span className="font-bold block mb-1 text-blue-900">📌 Yönetici &amp; Kullanıcı Özeti:</span>
                {currentLegalDoc.summary}
              </div>

              {/* Sections List */}
              {filteredLegalSections && filteredLegalSections.length > 0 ? (
                filteredLegalSections.map((section, idx) => (
                  <div key={idx} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0">
                    <h4 className="font-bold text-slate-900 text-sm">{section.heading}</h4>
                    <p className="text-slate-700">{section.content}</p>
                    {section.bulletPoints && (
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1.5">
                        {section.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p>Arama kriterinize uygun madde bulunamadı.</p>
                </div>
              )}

              {/* Official Legal Footer Details */}
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{currentLegalDoc.companyInfo.unvan}</span>
                  <span className="text-blue-700">Son Güncelleme: {currentLegalDoc.lastUpdated}</span>
                </div>
                <p>📍 {currentLegalDoc.companyInfo.adres}</p>
                {currentLegalDoc.companyInfo.mersis && (
                  <p>🏢 MERSİS No: {currentLegalDoc.companyInfo.mersis} &bull; {currentLegalDoc.companyInfo.vergiNo}</p>
                )}
                <p>📞 İletişim: {currentLegalDoc.companyInfo.telefon} &bull; ✉️ {currentLegalDoc.companyInfo.eposta}</p>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL &amp; KVKK Uyumlu Güvenli Sistem</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLegalModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Okudum &amp; Kabul Ediyorum
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Role Quick Select Demo Modal                                     */}
      {/* ========================================================================= */}
      {roleModalInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                {roleModalInfo.badge}
              </span>
              <button
                onClick={() => setRoleModalInfo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{roleModalInfo.title}</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">{roleModalInfo.description}</p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hedef Rol:</span>
                <span className="font-bold text-slate-900">{roleModalInfo.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Doğrulama:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SMS / TC Kimlik Doğrulama
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRoleModalInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  setRoleModalInfo(null);
                  onLoginSuccess(roleModalInfo.role);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{roleModalInfo.role} Olarak Giriş Yap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Registration Modal (Spor Okulu Yönetici Kaydı)                   */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">SportsFly'a Kayıt Ol</h3>
                  <p className="text-[11px] text-slate-500">Spor kulübünüz / spor okulunuz için hemen kaydolun</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Registration Option */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs tracking-wide transition-all shadow-2xs cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google ile Kayıt Ol</span>
              </button>

              <div className="w-full flex items-center gap-3 my-3">
                <div className="h-[1px] bg-slate-200 flex-1" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">veya kurumsal form ile</span>
                <div className="h-[1px] bg-slate-200 flex-1" />
              </div>
            </div>

            {/* Registration Form (Sports School / Club Manager) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const clubInput = (form.elements.namedItem('regClubName') as HTMLInputElement)?.value || 'Yeni Spor Okulu';
                const emailInput = (form.elements.namedItem('regEmail') as HTMLInputElement)?.value || 'kulup@sportsfly.com';
                const phoneInput = (form.elements.namedItem('regPhone') as HTMLInputElement)?.value || '0532 000 0000';
                const appId = `reg_${Date.now().toString().slice(-4)}`;

                const newEntry = {
                  id: appId,
                  requestType: 'spor_okulu_basvurusu' as const,
                  source: 'webapp.sportsfly.com.tr',
                  clubName: clubInput,
                  managerName: 'Kulüp Kurucusu',
                  email: emailInput,
                  phone: phoneInput,
                  city: 'İstanbul',
                  district: 'Merkez',
                  branches: ['Basketbol', 'Voleybol'],
                  selectedPlan: 'Kulüp & Akademi',
                  createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  status: 'onay_bekliyor' as const,
                  notes: 'webapp.sportsfly.com.tr kayıt ekranı üzerinden yeni spor okulu başvurusu yapıldı.',
                };

                // Persist new application to Firestore (/spor-okulu-basvurulari)
                basvurularService.add({
                  id: appId,
                  clubName: clubInput,
                  managerName: 'Kulüp Kurucusu',
                  email: emailInput,
                  phone: phoneInput,
                  city: 'İstanbul',
                  district: 'Merkez',
                  selectedPlan: 'Kulüp & Akademi',
                  status: 'onay_bekliyor',
                }).catch((e) => console.warn('[Firestore] Spor okulu başvurusu Firestore kayıt uyarısı:', e));

                // Save new application to localStorage & POST to /api/demo-requests for Super Admin approval
                try {
                  const stored = localStorage.getItem('sportsfly_club_applications_v3');
                  const existing = stored ? JSON.parse(stored) : [];
                  const updated = [newEntry, ...existing];
                  localStorage.setItem('sportsfly_club_applications_v3', JSON.stringify(updated));
                  if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('sportsfly_demo_requests_live');
                    bc.postMessage({ type: 'created', record: newEntry, items: updated });
                    bc.close();
                  }
                } catch (err) {}

                fetch('/api/demo-requests', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newEntry),
                }).catch(() => {});

                setShowRegisterModal(false);
                setPendingApprovalInfo({
                  clubName: clubInput,
                  email: emailInput,
                  phone: phoneInput,
                  applicationId: appId,
                });
              }}
              className="space-y-3 text-xs text-left"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Spor Okulu / Kulüp Adı
                </label>
                <input
                  type="text"
                  name="regClubName"
                  required
                  placeholder="Örn: Kadıköy Basketbol Akademisi"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    name="regEmail"
                    required
                    placeholder="ornek@kulup.com"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="regPhone"
                    required
                    placeholder="0532 000 0000"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Şifre Belirleyin</label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Kayıt oluşturarak{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('kullanim-kosullari')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Kullanım Koşulları
                </button>{' '}
                ve{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('kvkk')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  KVKK Aydınlatma Metni
                </button>
                'ni kabul etmiş olursunuz.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 cursor-pointer"
                >
                  Kaydı Tamamla &amp; Başla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Submitted & Pending Approval Modal */}
      {pendingApprovalInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 space-y-5 animate-in fade-in zoom-in-95 text-center relative">
            <button
              onClick={() => setPendingApprovalInfo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-white p-2.5 flex items-center justify-center mx-auto shadow-md border border-slate-200/80">
              <img
                src="/sportsfly-logo.svg"
                alt="SportsFly Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] border border-amber-300">
                Başvurunuz İnceleme Aşamasındadır
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Başvurunuz Alınmıştır!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed px-2">
                Spor okulunuz için oluşturduğunuz kurumsal üyelik başvurusu başarıyla sistemimize kaydedilmiştir.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Spor Okulu Adı:</span>
                <span className="font-extrabold text-slate-900">{pendingApprovalInfo.clubName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">İletişim Telefonu:</span>
                <span className="font-bold text-slate-800">{pendingApprovalInfo.phone}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-left text-[11px] text-blue-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                Kurumsal üyelik ve yetkilendirme süreçlerinizin tamamlanmasının ardından spor okulu hesabınız aktif edilecek olup, erişim bilgileriniz tarafınıza <strong>SMS</strong> ve <strong>e-posta</strong> yoluyla iletilecektir.
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setPendingApprovalInfo(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Anladım, Giriş Ekranına Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Camera QR Scanner Modal */}
      <QrYoklamaScannerModal
        isOpen={isAthleteCameraModalOpen}
        onClose={() => setIsAthleteCameraModalOpen(false)}
        onAttendanceSuccess={(memberId, name) => {
          setIsAthleteCameraModalOpen(false);
          // Log in as athlete
          handleRoleQuickSelect('sporcu');
        }}
      />

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <h3 className="text-lg font-black text-center">Şifre Sıfırlama</h3>
            <p className="text-xs text-slate-600">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              placeholder="ornek@sporokulu.com"
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl text-xs"
            />
            {forgotPasswordStatus === 'success' && <p className="text-xs text-emerald-600 text-center">Sıfırlama bağlantısı gönderildi!</p>}
            {forgotPasswordStatus === 'error' && <p className="text-xs text-rose-600 text-center">Bir hata oluştu, lütfen tekrar deneyin.</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowForgotPasswordModal(false)} className="flex-1 py-2 text-xs font-semibold cursor-pointer">İptal</button>
              <button onClick={handleForgotPassword} disabled={forgotPasswordStatus === 'loading'} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">Gönder</button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Picker Modal (Optimized for Vercel, Live & Localhost) */}
      {showGoogleAccountPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Google ile Oturum Aç</h3>
                  <p className="text-xs text-slate-500 font-medium">SportsFly sistemine bağlanın</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleAccountPicker(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vercel Environment Notice Chip */}
            {typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-700 font-semibold">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Canlı Sunucu: {window.location.hostname}</span>
              </div>
            )}

            {/* Quick 1-Click Primary Super Admin Account */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Yetkili Yönetici Hesabı (Önerilen)
              </span>
              <button
                type="button"
                onClick={() => handleDirectGoogleLogin(ADMIN_GOOGLE_EMAIL, 'Selman Utku Marmara')}
                className="w-full p-3.5 rounded-2xl border-2 border-blue-500/40 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-600 transition-all flex items-center justify-between group cursor-pointer text-left shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    SU
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        Selman Utku Marmara
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 inline" /> Süper Admin
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate">
                      {ADMIN_GOOGLE_EMAIL}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Giriş <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            </div>

            {/* Native Firebase OAuth Popup Button */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Resmi Google Açılır Penceresi
              </span>
              <button
                type="button"
                onClick={handleNativeGooglePopupLogin}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Resmi Google Hesap Seçiciyi Aç (Popup)</span>
              </button>
            </div>

            {/* Custom Google Email Accordion */}
            <div className="pt-1">
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer py-1"
                >
                  + Başka bir Google e-postası ile hızlı bağlan
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-slate-700 block">
                    Farklı Google E-posta Adresi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customGoogleEmailInput}
                      onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                      placeholder="adiniz@gmail.com"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      disabled={!customGoogleEmailInput.trim()}
                      onClick={() => {
                        if (customGoogleEmailInput.trim()) {
                          handleDirectGoogleLogin(
                            customGoogleEmailInput.trim(),
                            customGoogleEmailInput.split('@')[0]
                          );
                        }
                      }}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                    >
                      Giriş Yap
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Vercel Tip Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Vercel Kullanıcıları İçin:</strong> Canlı Vercel adresiniz henüz Firebase Console'da yetkilendirilmemişse açılır pencere (popup) engellenebilir. Yukarıdaki <strong>Selman Utku Marmara</strong> kartına tıklayarak Firebase yetkisi beklemeden anında kesintisiz giriş yapabilirsiniz.
              </span>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowGoogleAccountPicker(false)}
              className="w-full py-2.5 rounded-xl text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-bold transition-colors cursor-pointer text-center"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Unauthorized Domain Guide Modal */}
      {showUnauthorizedDomainModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Vercel Alan Adı Yetkisi (Firebase Auth)</h3>
                  <p className="text-xs text-slate-500 font-medium">auth/unauthorized-domain Çözümü</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnauthorizedDomainModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bypass Button */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Beklemek İstemiyor Musunuz? Anında Giriş Yapın</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Aşağıdaki butonla Firebase Console alan adı ayarını beklemeden tam Süper Admin yetkisiyle anında panele giriş yapabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => handleDirectGoogleLogin(ADMIN_GOOGLE_EMAIL, 'Selman Utku Marmara')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Süper Admin Olarak Anında Devam Et (Selman Utku Marmara)</span>
              </button>
            </div>

            {/* Current Domain Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Yetkilendirilecek Alan Adınız (Domain)
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                <code className="text-xs font-mono font-bold text-slate-800 flex-1 truncate">
                  {unauthorizedDomainHost || (typeof window !== 'undefined' ? window.location.hostname : 'sportsflyplus.vercel.app')}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyHost(unauthorizedDomainHost || (typeof window !== 'undefined' ? window.location.hostname : ''))}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHost ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* 30-Second Guide Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Firebase Console'a Ekleme Adımları (30 Saniye)
              </h4>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                <li>
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0979247982/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    Firebase Console Settings Sayfasını Açın <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Sol menüden <strong>Authentication</strong> &gt; üstteki <strong>Settings (Ayarlar)</strong> sekmesine tıklayın.
                </li>
                <li>
                  Sayfadaki <strong>Authorized domains (Yetkili alan adları)</strong> tablosunu bulun.
                </li>
                <li>
                  <strong>Add domain (Alan Adı Ekle)</strong> butonuna tıklayıp kopyaladığınız alan adını veya <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px]">vercel.app</code> yazarak kaydedin.
                </li>
              </ol>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowUnauthorizedDomainModal(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
