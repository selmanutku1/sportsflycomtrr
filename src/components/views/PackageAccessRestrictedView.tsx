import React from 'react';
import {
  Lock,
  ArrowRight,
  CheckCircle2,
  Phone,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { NavPage, PackagePlanType } from '../../types';
import {
  PACKAGE_DETAILS,
  PageRestrictionRule,
  setActiveSessionPlan,
  getPageRestrictionInfo,
  isSuperAdminUser,
} from '../../data/packagePermissions';
import { getStoredUserProfile, saveStoredUserProfile } from '../../data/userProfile';

interface PackageAccessRestrictedViewProps {
  page: NavPage;
  currentPlan: PackagePlanType;
  restriction?: PageRestrictionRule | null;
  restrictionInfo?: PageRestrictionRule | null;
  onNavigate: (page: NavPage) => void;
  onUpgradeRequest?: () => void;
}

export const PackageAccessRestrictedView: React.FC<PackageAccessRestrictedViewProps> = ({
  page,
  currentPlan,
  restriction,
  restrictionInfo,
  onNavigate,
  onUpgradeRequest,
}) => {
  const activeRestriction: PageRestrictionRule =
    restriction ||
    restrictionInfo ||
    getPageRestrictionInfo(page) || {
      minPlan: 'Kulüp & Akademi',
      minLevel: 2,
      featureTitle: 'Modül Erişimi Kısıtlandı',
      description: 'Bu sayfaya erişebilmek için spor okulu paketinizin yükseltilmesi gerekmektedir.',
    };

  const currentDetail = PACKAGE_DETAILS[currentPlan] || PACKAGE_DETAILS['Başlangıç Kulübü'];
  const requiredDetail = PACKAGE_DETAILS[activeRestriction.minPlan] || PACKAGE_DETAILS['Pro Akademi & Çoklu Şube'];

  const userProfile = getStoredUserProfile();
  const isSuper = isSuperAdminUser(userProfile?.role);

  const handleInstantUpgrade = () => {
    setActiveSessionPlan(activeRestriction.minPlan);
  };

  const handleSuperAdminBypass = () => {
    if (!isSuper) {
      saveStoredUserProfile({ ...userProfile, role: 'Süper Admin' });
    }
    onNavigate(page);
  };

  const handleUpgradeClick = () => {
    if (onUpgradeRequest) {
      onUpgradeRequest();
    } else {
      onNavigate('paketler');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Paket Erişimi Kısıtlandı
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Mevcut Paketiniz: <strong className="text-white">{currentPlan}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeRestriction.featureTitle}
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {activeRestriction.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <button
              onClick={handleUpgradeClick}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <SportsFlyIcon className="w-4 h-4" />
              <span>Paketleri İncele &amp; Yükselt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSuperAdminBypass}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              title="Süper Admin hesabı ile bu modüle doğrudan erişin"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-900" />
              <span>Süper Admin Olarak Eriş</span>
            </button>
            <button
              onClick={handleInstantUpgrade}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/15 cursor-pointer"
              title="Geliştirici / Yönetici Hızlı Testi: Bu pakete anında geçiş yapın"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Hızlı Test: {activeRestriction.minPlan} Paketine Geç</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Plan Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Aktif Paketiniz
              </span>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {currentDetail.name}
                <span className="text-xs font-normal text-slate-500">
                  ({currentDetail.monthlyPrice === 0 ? 'Ücretsiz / Özel' : `${currentDetail.monthlyPrice.toLocaleString('tr-TR')} ₺/ay`})
                </span>
              </h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentDetail.badgeClass}`}>
              Mevcut
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">Bu Paketin Kapsamı:</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {currentDetail.allowedModules.map((m, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Required Plan Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border-2 border-blue-300 shadow-xs p-5 space-y-4 relative">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Gereken Minimum Paket
              </span>
              <h3 className="text-lg font-extrabold text-blue-900 flex items-center gap-2">
                {requiredDetail.name}
                <span className="text-xs font-semibold text-blue-700">
                  ({requiredDetail.monthlyPrice === 0 ? 'Özel Teklif' : `${requiredDetail.monthlyPrice.toLocaleString('tr-TR')} ₺/ay`})
                </span>
              </h3>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-2xs">
              Tavsiye Edilen
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-blue-900">Bu Paket İle Açılacaklar:</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {requiredDetail.allowedModules.map((m, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <SportsFlyIcon className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-slate-900">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('paketler')}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{requiredDetail.name} Paketine Yükselt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Assistance & Contact Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Paket ve Lisans Destek Hattı</p>
            <p className="text-slate-500">Sporsepeti / SportsFly müşteri hizmetlerinden anında kurumsal teklif alabilirsiniz.</p>
          </div>
        </div>
        <a
          href="tel:02168501907"
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold flex items-center gap-2 shrink-0 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span>0216 850 1907</span>
        </a>
      </div>
    </div>
  );
};
