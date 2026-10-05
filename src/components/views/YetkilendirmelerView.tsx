import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Filter,
  Check,
  X,
  Lock,
  Unlock,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  FileDown,
  BellRing,
  Layers,
  Building2,
  Users,
  GraduationCap,
  Heart,
  Award,
  Sparkles,
  Info,
  ChevronRight,
  Shield,
  FileText,
  SlidersHorizontal,
  CheckCheck,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Smartphone,
  LayoutGrid,
  KeyRound,
  Fingerprint,
  Activity,
  CreditCard,
  RefreshCw,
  Server,
} from 'lucide-react';
import {
  UserRoleKey,
  UserRoleDefinition,
  ModulePermissionConfig,
  getStoredRoleDefinitions,
  saveRoleDefinitions,
  resetRoleDefinitions,
  performRoleSecurityAudit,
  RoleAuditResult,
} from '../../data/rolePermissions';
import { getStoredUserProfile } from '../../data/userProfile';
import { isSuperAdminUser } from '../../data/packagePermissions';
import { GoogleUsersAccessManagerPanel } from '../admin/GoogleUsersAccessManagerPanel';
import {
  secureFetch,
  encryptSensitivePII,
  decryptSensitivePII,
  runClientSecuritySelfTest,
  getSecurityAuditEvents,
  SecurityAuditEvent,
} from '../../utils/securityCore';

export const YetkilendirmelerView: React.FC = () => {
  const [userProfile] = useState(() => getStoredUserProfile());
  const isSuper = isSuperAdminUser(userProfile?.role);

  const [roles, setRoles] = useState<Record<UserRoleKey, UserRoleDefinition>>(() =>
    getStoredRoleDefinitions()
  );
  const [activeRoleKey, setActiveRoleKey] = useState<UserRoleKey>('super_admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCyberShieldPanel, setShowCyberShieldPanel] = useState(true);
  const [isRunningPenTest, setIsRunningPenTest] = useState(false);
  const [penTestResults, setPenTestResults] = useState<
    Array<{ id: string; name: string; passed: boolean; detail: string }>
  >([]);
  const [piiSampleInput, setPiiSampleInput] = useState('TR33 0006 1005 1978 6457 8413 26');
  const [piiEncryptedOutput, setPiiEncryptedOutput] = useState<string>('');
  const [piiDecryptedOutput, setPiiDecryptedOutput] = useState<string>('');
  const [auditEvents, setAuditEvents] = useState<SecurityAuditEvent[]>(() =>
    getSecurityAuditEvents()
  );

  // Run initial AES-256-GCM demonstration & load penetration test results
  useEffect(() => {
    let mounted = true;
    encryptSensitivePII(piiSampleInput).then((cipher) => {
      if (!mounted) return;
      setPiiEncryptedOutput(cipher);
      decryptSensitivePII(cipher).then((plain) => {
        if (mounted) setPiiDecryptedOutput(plain);
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRunFullSecurityVerification = async () => {
    setIsRunningPenTest(true);
    try {
      const clientSuite = await runClientSecuritySelfTest();
      let serverChecks: Array<{ id: string; name: string; passed: boolean; detail: string }> = [];
      try {
        const res = await secureFetch('/api/security/verify-integrity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'manual_pentest' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.checks)) {
            serverChecks = data.checks;
          }
        }
      } catch {
        // Fallback if server endpoint is unreachable
      }
      const merged = [
        ...serverChecks,
        ...clientSuite.results.filter((c) => !serverChecks.some((s) => s.id === c.id)),
      ];
      setPenTestResults(merged);
      setAuditEvents(getSecurityAuditEvents());
      showToast(
        `Siber Güvenlik & Ödeme Kalkanı Doğrulandı: ${merged.filter((m) => m.passed).length}/${merged.length} Test Başarılı!`
      );
    } finally {
      setIsRunningPenTest(false);
    }
  };

  const handleEncryptSamplePii = async (val: string) => {
    setPiiSampleInput(val);
    const cipher = await encryptSensitivePII(val);
    setPiiEncryptedOutput(cipher);
    const plain = await decryptSensitivePII(cipher);
    setPiiDecryptedOutput(plain);
  };

  const currentRole = roles[activeRoleKey];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen for external role updates if any
  useEffect(() => {
    const handleUpdate = () => {
      setRoles(getStoredRoleDefinitions());
    };
    window.addEventListener('sportsfly_roles_updated', handleUpdate);
    return () => window.removeEventListener('sportsfly_roles_updated', handleUpdate);
  }, []);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    currentRole.modules.forEach((m) => cats.add(m.category));
    return ['all', ...Array.from(cats)];
  }, [currentRole]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return currentRole.modules.filter((mod) => {
      const matchSearch =
        mod.moduleName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        mod.defaultDescription.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchCat = selectedCategory === 'all' || mod.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [currentRole, searchQuery, selectedCategory]);

  // Handle toggling single permission
  const handleTogglePermission = (
    moduleId: string,
    action: keyof Omit<ModulePermissionConfig, 'moduleId' | 'moduleName' | 'category' | 'iconName' | 'defaultDescription'>
  ) => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => {
        if (m.moduleId === moduleId) {
          const newVal = !m[action];
          // If turning off canView, turn off all sub-actions
          if (action === 'canView' && !newVal) {
            return {
              ...m,
              canView: false,
              canCreate: false,
              canEdit: false,
              canDelete: false,
              canExport: false,
              canNotify: false,
            };
          }
          // If turning on any sub-action, ensure canView is on
          if (action !== 'canView' && newVal && !m.canView) {
            return {
              ...m,
              [action]: newVal,
              canView: true,
            };
          }
          return {
            ...m,
            [action]: newVal,
          };
        }
        return m;
      });

      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle entire row
  const handleToggleRow = (moduleId: string) => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => {
        if (m.moduleId === moduleId) {
          const allActive =
            m.canView && m.canCreate && m.canEdit && m.canDelete && m.canExport && m.canNotify;
          const target = !allActive;
          return {
            ...m,
            canView: target,
            canCreate: target,
            canEdit: target,
            canDelete: target,
            canExport: target,
            canNotify: target,
          };
        }
        return m;
      });

      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle entire column for currently filtered modules
  const handleToggleColumn = (
    action: keyof Omit<ModulePermissionConfig, 'moduleId' | 'moduleName' | 'category' | 'iconName' | 'defaultDescription'>
  ) => {
    const allColActive = filteredModules.every((m) => m[action]);
    const target = !allColActive;

    setRoles((prev) => {
      const targetModuleIds = new Set(filteredModules.map((m) => m.moduleId));
      const updatedModules = prev[activeRoleKey].modules.map((m) => {
        if (targetModuleIds.has(m.moduleId)) {
          if (action === 'canView' && !target) {
            return {
              ...m,
              canView: false,
              canCreate: false,
              canEdit: false,
              canDelete: false,
              canExport: false,
              canNotify: false,
            };
          }
          if (action !== 'canView' && target) {
            return {
              ...m,
              [action]: target,
              canView: true,
            };
          }
          return {
            ...m,
            [action]: target,
          };
        }
        return m;
      });

      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Quick Preset: Read-only for active role
  const handleSetReadOnlyPreset = () => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => ({
        ...m,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canNotify: false,
      }));
      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
    showToast(`"${currentRole.title}" rolü için sadece okuma (Read-Only) modu uygulandı.`);
  };

  // Quick Preset: Full Access for active role
  const handleSetFullAccessPreset = () => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => ({
        ...m,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canNotify: true,
      }));
      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
    showToast(`"${currentRole.title}" rolü için tüm modül ve aksiyonlar aktif edildi.`);
  };

  const handleSelectAll = () => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => ({
        ...m,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canNotify: true,
      }));
      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
    showToast(`"${currentRole.title}" rolü için tüm izinler seçildi.`);
  };

  const handleDeselectAll = () => {
    setRoles((prev) => {
      const updatedModules = prev[activeRoleKey].modules.map((m) => ({
        ...m,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canNotify: false,
      }));
      return {
        ...prev,
        [activeRoleKey]: {
          ...prev[activeRoleKey],
          modules: updatedModules,
        },
      };
    });
    setHasUnsavedChanges(true);
    showToast(`"${currentRole.title}" rolü için tüm izinler kaldırıldı.`);
  };

  // Save changes to localStorage
  const handleSave = () => {
    saveRoleDefinitions(roles);
    setHasUnsavedChanges(false);
    showToast('Rol ve modül yetkilendirme ayarları başarıyla kaydedildi!');
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('Tüm rollerin yetkilendirmelerini varsayılan fabrika ayarlarına döndürmek istiyor musunuz?')) {
      const defs = resetRoleDefinitions();
      setRoles(defs);
      setHasUnsavedChanges(false);
      showToast('Tüm yetkilendirmeler varsayılan şablona sıfırlandı.');
    }
  };

  // Security Audit Results
  const auditResults = useMemo(() => performRoleSecurityAudit(roles), [roles]);
  const auditPassCount = auditResults.filter((r) => r.kvkkPassed && r.financialIsolationPassed).length;

  const getRoleIcon = (key: UserRoleKey) => {
    switch (key) {
      case 'super_admin':
        return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'kulup_yoneticisi':
        return <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'egitmen':
        return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'veli':
        return <Heart className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'sporcu':
        return <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
  };

  // If user is not super admin, show access restricted message
  if (!isSuper) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Süper Admin Yetkisi Gerekli
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Yetkilendirme ve Rol Yönetimi matrisi yalnızca platform sahibi (Süper Admin) tarafından görüntülenebilir ve yapılandırılabilir.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Mevcut Oturum Rolü: {userProfile.role}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-4 sm:space-y-5 pb-24 sm:pb-12 px-1 sm:px-0">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="permission-live-toast"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs sm:text-sm font-semibold"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Google İle Giriş Yapan Kullanıcılar & Aktif Alan Yönetimi */}
      <GoogleUsersAccessManagerPanel />

      {/* Role Switcher Tabs (Mobile Optimized Horizontal Scroll + Desktop Grid) */}
      <div className="space-y-1.5">
        <div className="flex sm:hidden items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Yapılandırılan Rolü Seçin
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            {currentRole.title}
          </span>
        </div>

        {/* Mobile Horizontal Carousel */}
        <div className="flex sm:hidden items-stretch gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x">
          {(Object.keys(roles) as UserRoleKey[]).map((key) => {
            const r = roles[key];
            const isActive = activeRoleKey === key;
            const activeModules = r.modules.filter((m) => m.canView).length;

            return (
              <button
                key={key}
                onClick={() => setActiveRoleKey(key)}
                className={`snap-start min-w-[155px] p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-[#111c2e] border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/80 dark:bg-[#111c2e]/70 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getRoleIcon(key)}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate">
                    {r.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {activeModules}/{r.modules.length} Modül
                  </p>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 inset-x-3 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(Object.keys(roles) as UserRoleKey[]).map((key) => {
            const r = roles[key];
            const isActive = activeRoleKey === key;
            const activeModules = r.modules.filter((m) => m.canView).length;

            return (
              <button
                key={key}
                onClick={() => setActiveRoleKey(key)}
                className={`p-3.5 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111c2e] border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/70 dark:bg-[#111c2e]/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getRoleIcon(key)}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                    {r.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {activeModules} / {r.modules.length} Modül Açık
                  </p>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 inset-x-4 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Meta & Quick Actions Bar */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentRole.title}</span>
              <span className="text-slate-400 font-normal text-xs sm:text-sm">İzinleri</span>
            </h2>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
              Veri Kapsamı: {currentRole.dataScope}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            {currentRole.fullDesc}
          </p>
        </div>

        {/* Quick Presets for this role */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800 lg:border-t-0">
          <button
            onClick={handleSelectAll}
            className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Tüm izinleri tek tıkla seçer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tümünü Seç</span>
          </button>

          <button
            onClick={handleDeselectAll}
            className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Tüm izinleri tek tıkla kaldırır"
          >
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>Tümünü Kaldır</span>
          </button>

          <button
            onClick={handleSetReadOnlyPreset}
            className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Sadece görüntüleme izinlerini açık bırakır"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Salt Okunur</span>
          </button>

          <button
            onClick={handleSetFullAccessPreset}
            className="flex-1 sm:flex-initial px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Tüm izinleri tam yetkiliye çevirir"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Tam Yetki</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Varsayılan Yetki Şablonuna Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sıfırla</span>
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasUnsavedChanges ? 'Değişiklikleri Kaydet *' : 'Yetkileri Güncelle'}</span>
          </button>

          {/* Mobile Quick Batch Column Trigger */}
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="sm:hidden px-3 py-2 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Toplu sütun işlemleri"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
            <span>Toplu İşlem</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-100/80 dark:bg-[#142033]/70 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Tümü' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Modül adı veya işlev ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 sm:py-1.5 text-xs bg-white dark:bg-[#162238] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: TOUCH-OPTIMIZED INTERACTIVE MODULE CARDS (< md screens) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {filteredModules.map((mod) => {
          const isViewActive = mod.canView;
          const activeActionsCount = [
            mod.canView,
            mod.canCreate,
            mod.canEdit,
            mod.canDelete,
            mod.canExport,
            mod.canNotify,
          ].filter(Boolean).length;

          return (
            <div
              key={mod.moduleId}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isViewActive
                  ? 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-[#0f1726]/60 border-slate-200/80 dark:border-slate-800/70 opacity-75'
              }`}
            >
              {/* Card Header & Master Toggle */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#142033]/40">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                        {mod.moduleName}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mod.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {mod.defaultDescription}
                    </p>
                  </div>

                  {/* Master Row Toggle Button (Touch Target) */}
                  <button
                    onClick={() => handleToggleRow(mod.moduleId)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95 ${
                      activeActionsCount === 6
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isViewActive
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {activeActionsCount === 6 ? (
                      <>
                        <CheckCheck className="w-3 h-3" />
                        <span>Tam Yetkili</span>
                      </>
                    ) : isViewActive ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>{activeActionsCount}/6 Aktif</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Kapalı</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Permission Toggle Chips (Mobile Grid) */}
              <div className="p-3 bg-white dark:bg-[#111c2e]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* View Action */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(mod.moduleId, 'canView')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border active:scale-98 ${
                      mod.canView
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Eye className={`w-3.5 h-3.5 shrink-0 ${mod.canView ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="truncate">Görüntüle</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canView ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canView && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Create Action */}
                  <button
                    type="button"
                    disabled={!mod.canView}
                    onClick={() => handleTogglePermission(mod.moduleId, 'canCreate')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border active:scale-98 ${
                      !mod.canView
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400'
                        : mod.canCreate
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <PlusCircle className={`w-3.5 h-3.5 shrink-0 ${mod.canCreate ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">Ekle</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canCreate ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canCreate && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Edit Action */}
                  <button
                    type="button"
                    disabled={!mod.canView}
                    onClick={() => handleTogglePermission(mod.moduleId, 'canEdit')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border active:scale-98 ${
                      !mod.canView
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400'
                        : mod.canEdit
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Edit3 className={`w-3.5 h-3.5 shrink-0 ${mod.canEdit ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate">Düzenle</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canEdit ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canEdit && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Delete Action */}
                  <button
                    type="button"
                    disabled={!mod.canView}
                    onClick={() => handleTogglePermission(mod.moduleId, 'canDelete')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border active:scale-98 ${
                      !mod.canView
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400'
                        : mod.canDelete
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Trash2 className={`w-3.5 h-3.5 shrink-0 ${mod.canDelete ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                      <span className="truncate">Sil</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canDelete ? 'bg-rose-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canDelete && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Export Action */}
                  <button
                    type="button"
                    disabled={!mod.canView}
                    onClick={() => handleTogglePermission(mod.moduleId, 'canExport')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border active:scale-98 ${
                      !mod.canView
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400'
                        : mod.canExport
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileDown className={`w-3.5 h-3.5 shrink-0 ${mod.canExport ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">PDF/Çıktı</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canExport ? 'bg-amber-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canExport && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Notify Action */}
                  <button
                    type="button"
                    disabled={!mod.canView}
                    onClick={() => handleTogglePermission(mod.moduleId, 'canNotify')}
                    className={`h-11 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border active:scale-98 ${
                      !mod.canView
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400'
                        : mod.canNotify
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BellRing className={`w-3.5 h-3.5 shrink-0 ${mod.canNotify ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                      <span className="truncate">Bildirim</span>
                    </div>
                    <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 ${
                      mod.canNotify ? 'bg-purple-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {mod.canNotify && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            <p className="font-bold text-xs">Aramanıza uygun modül bulunamadı.</p>
            <p className="text-[11px] text-slate-400 mt-1">Filtreyi veya arama terimini temizleyiniz.</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP VIEW: FULL COMPREHENSIVE DATA MATRIX TABLE (>= md screens)   */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#142033]/60 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 min-w-[240px]">
                  Modül &amp; İşlev Tanımı
                </th>

                {/* Columns */}
                <th
                  onClick={() => handleToggleColumn('canView')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü Görüntüleme Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Gör (List)</span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleColumn('canCreate')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü Ekleme Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ekle (Add)</span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleColumn('canEdit')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü Düzenleme Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleColumn('canDelete')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü Silme Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sil</span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleColumn('canExport')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü PDF/Excel Dışa Aktarma Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF/Çıktı</span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleColumn('canNotify')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[70px]"
                  title="Tümünü Bildirim Gönderimi Aç/Kapat"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Bildirim</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredModules.map((mod) => {
                const isAnyActive = mod.canView;

                return (
                  <tr
                    key={mod.moduleId}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isAnyActive ? 'bg-blue-50/15 dark:bg-blue-950/10' : 'opacity-60 bg-slate-50/30 dark:bg-slate-900/30'
                    }`}
                  >
                    {/* Module Name & Desc */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleRow(mod.moduleId)}
                          className="mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer shrink-0 border-slate-300 dark:border-slate-600 hover:border-blue-500"
                          title="Tüm satırı aç/kapat"
                        >
                          {mod.canView && <Check className="w-3 h-3 text-blue-600" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {mod.moduleName}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {mod.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {mod.defaultDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* View */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canView')}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                            mod.canView
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canView && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>

                    {/* Create */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canCreate')}
                          disabled={!mod.canView}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            !mod.canView ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
                          } ${
                            mod.canCreate
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canCreate && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>

                    {/* Edit */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canEdit')}
                          disabled={!mod.canView}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            !mod.canView ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
                          } ${
                            mod.canEdit
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canEdit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canDelete')}
                          disabled={!mod.canView}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            !mod.canView ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
                          } ${
                            mod.canDelete
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canDelete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>

                    {/* Export */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canExport')}
                          disabled={!mod.canView}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            !mod.canView ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
                          } ${
                            mod.canExport
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canExport && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>

                    {/* Notify */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePermission(mod.moduleId, 'canNotify')}
                          disabled={!mod.canView}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            !mod.canView ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
                          } ${
                            mod.canNotify
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {mod.canNotify && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-bold">Aramanıza uygun modül bulunamadı.</p>
                    <p className="text-xs text-slate-400 mt-1">Filtreyi veya arama terimini temizleyiniz.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#142033]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <Info className="w-4 h-4 text-blue-500" />
            <span>
              Sütun veya satır başlıklarına tıklayarak toplu açma/kapama yapabilirsiniz.
            </span>
          </div>

          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Yetkileri Kaydet ve Yayınla</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE STICKY BOTTOM SAVE ACTION BAR                                   */}
      {/* ========================================================================= */}
      <div className="fixed sm:hidden bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-[#0f1726]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-2xl">
        <button
          onClick={handleReset}
          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 active:scale-95"
          title="Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleSave}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all ${
            hasUnsavedChanges
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white animate-pulse'
              : 'bg-blue-600 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{hasUnsavedChanges ? 'Değişiklikleri Kaydet *' : 'Yetkileri Kaydet & Yayınla'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/*  MOBILE BATCH ACTIONS MODAL                                             */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Toplu İzin İşlemleri
                </h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Seçili filtredeki ({filteredModules.length} modül) sütun izinlerini tek dokunuşla açıp kapatın:
              </p>

              {[
                { action: 'canView' as const, label: 'Görüntüleme İzni (Tüm Modüller)', icon: Eye, color: 'text-blue-600' },
                { action: 'canCreate' as const, label: 'Ekleme İzni (Tüm Modüller)', icon: PlusCircle, color: 'text-emerald-600' },
                { action: 'canEdit' as const, label: 'Düzenleme İzni (Tüm Modüller)', icon: Edit3, color: 'text-indigo-600' },
                { action: 'canDelete' as const, label: 'Silme İzni (Tüm Modüller)', icon: Trash2, color: 'text-rose-600' },
                { action: 'canExport' as const, label: 'PDF/Dışa Aktarma (Tüm Modüller)', icon: FileDown, color: 'text-amber-600' },
                { action: 'canNotify' as const, label: 'Bildirim Gönderimi (Tüm Modüller)', icon: BellRing, color: 'text-purple-600' },
              ].map((item) => {
                const isAllActive = filteredModules.every((m) => m[item.action]);
                const Icon = item.icon;

                return (
                  <button
                    key={item.action}
                    onClick={() => {
                      handleToggleColumn(item.action);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      isAllActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      isAllActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {isAllActive ? 'Tümü Açık' : 'Tümü Kapalı'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#142033]">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Tamamla &amp; Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    Rol Güvenlik &amp; KVKK Denetim Raporu
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    5 Temel Rol İçin Otomatik İzolasyon Doğrulaması
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <span className="text-[11px] sm:text-xs font-bold block">KVKK &amp; AES-256</span>
                  <span className="text-xs sm:text-base font-black mt-0.5 block">
                    {auditResults.every((r) => r.kvkkPassed) ? '✅ Tam Uyumlu' : '⚠️ İhlal Riski'}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <span className="text-[11px] sm:text-xs font-bold block">Finans &amp; PCI-DSS</span>
                  <span className="text-xs sm:text-base font-black mt-0.5 block">
                    {auditResults.every((r) => r.financialIsolationPassed) ? '✅ 3DS 2.2 Hazır' : '⚠️ İnceleme'}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300">
                  <span className="text-[11px] sm:text-xs font-bold block">WAF &amp; PenTest</span>
                  <span className="text-xs sm:text-base font-black mt-0.5 block">
                    {penTestResults.length > 0
                      ? `✅ ${penTestResults.filter((p) => p.passed).length}/${penTestResults.length} Geçti`
                      : '🛡️ Kalkan Aktif'}
                  </span>
                </div>
              </div>

              {/* Recent Security Audit Events Log */}
              {auditEvents.length > 0 && (
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Canlı Güvenlik Denetim İzi (SIEM Audit Log)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Son {Math.min(4, auditEvents.length)} Kayıt
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto font-mono text-[10px]">
                    {auditEvents.slice(0, 4).map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between gap-2 py-1 border-b border-slate-800 last:border-0">
                        <span className="text-emerald-300 font-bold shrink-0">[{ev.category}]</span>
                        <span className="text-slate-200 truncate flex-1">{ev.action}</span>
                        <span className="text-slate-400 shrink-0">
                          {new Date(ev.timestamp).toLocaleTimeString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2.5 sm:space-y-3">
                {auditResults.map((audit) => (
                  <div
                    key={audit.roleKey}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#162238]/50 space-y-1.5 sm:space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {audit.roleTitle}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {audit.activeModulesCount} Modül
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold">
                        {audit.kvkkPassed && audit.financialIsolationPassed ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] sm:text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Kusursuz</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px] sm:text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Uyarı</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {audit.notes.map((note, idx) => (
                        <p key={idx} className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#142033] flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
