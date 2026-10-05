import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Phone,
  Calendar,
} from 'lucide-react';
import { ACTIVE_ATHLETES_ROSTER, ActiveAthleteItem } from '../../../data/activeAthletesData';
import { NavPage } from '../../../types';

interface ActiveAthletesQuickListProps {
  onNavigate?: (page: NavPage) => void;
  resolvedBranchId?: string;
}

export const ActiveAthletesQuickList: React.FC<ActiveAthletesQuickListProps> = ({ onNavigate, resolvedBranchId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [athletes] = useState<ActiveAthleteItem[]>(ACTIVE_ATHLETES_ROSTER);

  // SECURE MULTI-BRANCH MAPPER
  const getAthleteSubeId = (ath: ActiveAthleteItem) => {
    const facilityLower = ath.facility.toLowerCase();
    if (facilityLower.includes('merkez')) return 'sube-kadikoy';
    if (facilityLower.includes('batı') || facilityLower.includes('doğu')) return 'sube-atasehir';
    if (facilityLower.includes('olimpik') || facilityLower.includes('beşiktaş')) return 'sube-besiktas';
    if (facilityLower.includes('çankaya') || facilityLower.includes('ankara')) return 'sube-cankaya';
    // Fallback hash
    const charCode = ath.id.charCodeAt(ath.id.length - 1) || 0;
    const branchIds = ['sube-kadikoy', 'sube-atasehir', 'sube-besiktas', 'sube-cankaya'];
    return branchIds[charCode % 4];
  };

  // Restrict list to the resolved active branch scope (Kadıköy only for Club Managers, all/selected for Super Admin)
  const scopedAthletes = !resolvedBranchId || resolvedBranchId === 'all'
    ? athletes
    : athletes.filter(ath => getAthleteSubeId(ath) === resolvedBranchId);

  // Dynamic counts calculated from the branch-scoped collection
  const branchCounts = {
    all: scopedAthletes.length,
    Basketbol: scopedAthletes.filter(a => a.branch === 'Basketbol').length,
    Voleybol: scopedAthletes.filter(a => a.branch === 'Voleybol').length,
    Yüzme: scopedAthletes.filter(a => a.branch === 'Yüzme').length,
    Jimnastik: scopedAthletes.filter(a => a.branch === 'Jimnastik').length,
  };

  const filteredAthletes = scopedAthletes.filter((ath) => {
    const matchesSearch =
      ath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ath.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ath.categoryGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ath.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === 'all' || ath.branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Mevcut Aktif Sporcular Listesi
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {scopedAthletes.length} Aktif Sporcu
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kulübünüzde lisansı ve antrenman kaydı aktif olan tüm sporcuların güncel dökümü
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('sporcular')}
            className="self-start sm:self-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50"
          >
            <span>Tüm Sporcu Yönetimi ({scopedAthletes.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/50 dark:bg-[#162238]/30 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Branch Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedBranch('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBranch === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            Tüm Branşlar ({branchCounts.all})
          </button>
          <button
            onClick={() => setSelectedBranch('Basketbol')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBranch === 'Basketbol'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            Basketbol ({branchCounts.Basketbol})
          </button>
          <button
            onClick={() => setSelectedBranch('Voleybol')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBranch === 'Voleybol'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            Voleybol ({branchCounts.Voleybol})
          </button>
          <button
            onClick={() => setSelectedBranch('Yüzme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBranch === 'Yüzme'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            Yüzme ({branchCounts.Yüzme})
          </button>
          <button
            onClick={() => setSelectedBranch('Jimnastik')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBranch === 'Jimnastik'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            Jimnastik ({branchCounts.Jimnastik})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, lisans no veya veli ara..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Athlete Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#162238]/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Sporcu Bilgisi</th>
              <th className="py-3 px-4">Branş &amp; Grup</th>
              <th className="py-3 px-4">Tesis &amp; Antrenör</th>
              <th className="py-3 px-4">Veli İletişim</th>
              <th className="py-3 px-4 text-center">Katılım Oranı</th>
              <th className="py-3 px-4">Aidat Durumu</th>
              <th className="py-3 px-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAthletes.map((ath) => (
              <tr
                key={ath.id}
                onClick={() => onNavigate?.('sporcular')}
                className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                {/* 1. Athlete Info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={ath.avatarUrl}
                      alt={ath.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <span>{ath.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Aktif Sporcu" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <span>{ath.code}</span>
                        <span>&bull;</span>
                        <span>{ath.birthYear} Doğumlu ({ath.gender})</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Branch & Group */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {ath.categoryGroup}
                  </div>
                  <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded mt-0.5">
                    {ath.branch}
                  </span>
                </td>

                {/* 3. Facility & Coach */}
                <td className="py-3 px-4">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {ath.facility}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Antrenör: <strong className="text-slate-600 dark:text-slate-300">{ath.coach}</strong>
                  </div>
                </td>

                {/* 4. Parent Info */}
                <td className="py-3 px-4">
                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    {ath.parentName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    <span>{ath.parentPhone}</span>
                  </div>
                </td>

                {/* 5. Attendance Rate */}
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      %{ath.attendanceRate}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div
                        style={{ width: `${ath.attendanceRate}%` }}
                        className={`h-full rounded-full ${
                          ath.attendanceRate >= 90
                            ? 'bg-emerald-500'
                            : ath.attendanceRate >= 80
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {ath.attendedCount}/{ath.totalSessions} Seans
                    </span>
                  </div>
                </td>

                {/* 6. Payment Status */}
                <td className="py-3 px-4">
                  {ath.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" />
                      ₺{ath.monthlyFee} / Ödendi
                    </span>
                  ) : ath.paymentStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                      <Clock className="w-3 h-3" />
                      ₺{ath.monthlyFee} / Bekliyor
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-800/50">
                      <AlertCircle className="w-3 h-3" />
                      ₺{ath.monthlyFee} / Gecikmede
                    </span>
                  )}
                </td>

                {/* 7. Action */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate?.('sporcular');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Profil &gt;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3.5 bg-slate-50/70 dark:bg-[#162238]/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Görüntülenen: <strong>{filteredAthletes.length}</strong> / {scopedAthletes.length} Aktif Sporcu</span>
        <button
          onClick={() => onNavigate?.('sporcular')}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Tümünü Filtrele ve Yönet</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
