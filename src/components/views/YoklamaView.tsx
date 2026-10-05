import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  Save,
  Check,
  ChevronDown,
  Zap,
  Bot,
  Sparkles,
  ShieldCheck,
  QrCode,
  Camera,
  Smartphone,
  BellRing,
  Bell,
  Send,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { GrupItem } from '../../types';
import { INITIAL_GRUPLAR } from '../../data/mockMuhasebeData';
import { processAttendanceAutomation } from '../../utils/sporpuanAutomation';
import { DynamicQrAttendanceModal } from '../modals/DynamicQrAttendanceModal';
import { QrYoklamaScannerModal } from '../modals/QrYoklamaScannerModal';
import { YoklamaHatirlatmaModal } from '../modals/YoklamaHatirlatmaModal';
import { YoklamaRaporExportModal } from '../modals/YoklamaRaporExportModal';
import { executeYoklamaReminderTrigger, getAutomationConfig } from '../../services/yoklamaHatirlaticiService';

// Types for local state
type AttendanceStatus = 'present' | 'absent' | 'excused' | null;

interface AttendanceRecord {
  memberId: string;
  status: AttendanceStatus;
}

export const YoklamaView: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<GrupItem | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [automationSummary, setAutomationSummary] = useState<{
    awardedCount: number;
    totalPointsGiven: number;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // QR, Reminder & Report Modals state
  const [isDynamicQrModalOpen, setIsDynamicQrModalOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Listen for live QR check-ins triggered from camera scanner or athlete phone
  useEffect(() => {
    const handleQrCheckIn = (e: CustomEvent<{ memberId: string; name: string }>) => {
      if (e.detail && e.detail.memberId) {
        setAttendanceState((prev) => ({
          ...prev,
          [e.detail.memberId]: 'present',
        }));
      }
    };

    window.addEventListener('sportsfly_qr_checkin' as any, handleQrCheckIn);
    return () => {
      window.removeEventListener('sportsfly_qr_checkin' as any, handleQrCheckIn);
    };
  }, []);

  // Groups list
  const gruplar = INITIAL_GRUPLAR;

  // Change group
  const handleGroupSelect = (group: GrupItem) => {
    setSelectedGroup(group);
    setIsDropdownOpen(false);
    
    // Reset attendance state when group changes
    const initialState: Record<string, AttendanceStatus> = {};
    group.members?.forEach(m => {
      initialState[m.id] = null; // default untouched
    });
    setAttendanceState(initialState);
    setAutomationSummary(null);
  };

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [memberId]: status
    }));
  };

  const markAllAs = (status: AttendanceStatus) => {
    if (!selectedGroup) return;
    const newState: Record<string, AttendanceStatus> = {};
    selectedGroup.members?.forEach(m => {
      newState[m.id] = status;
    });
    setAttendanceState(newState);
  };

  const handleSave = () => {
    if (!selectedGroup || !selectedGroup.members) return;
    setIsSaving(true);

    // 1. Process automated SporPuan awarding (Antrenmana Katılım + Haftalık Tam Devam + Katılım Serisi)
    const attendancePayload = selectedGroup.members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      status: attendanceState[m.id] || null,
    }));

    const autoRes = processAttendanceAutomation(
      attendancePayload,
      selectedGroup.name,
      attendanceDate
    );

    // 2. Automated Reminder Trigger: Check if absent athletes exist and trigger configured parent/trainer notifications
    const absentMembers = selectedGroup.members.filter(
      (m) => attendanceState[m.id] === 'absent' || attendanceState[m.id] === null
    );

    const config = getAutomationConfig();
    if (config.autoSendOnSave && absentMembers.length > 0) {
      const recipients = absentMembers.map((m) => ({
        memberId: m.id,
        athleteName: m.name,
        parentName: `Veli (${m.name.split(' ')[0]})`,
        parentPhone: m.phone || '05300000000',
        trainerName: selectedGroup.instructorName,
        groupName: selectedGroup.name,
        status: (attendanceState[m.id] as any) || 'unmarked',
      }));

      executeYoklamaReminderTrigger({
        groupName: selectedGroup.name,
        trainingDate: attendanceDate,
        recipients,
        targetAudience: config.targetAudience || 'parent',
        channels: config.channels,
        triggeredBy: 'Otomatik Yoklama Kaydetme Tetikleyicisi',
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setAutomationSummary({
        awardedCount: autoRes.awardedCount,
        totalPointsGiven: autoRes.totalPointsGiven,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4500);
    }, 600);
  };

  const getFilteredMembers = () => {
    if (!selectedGroup || !selectedGroup.members) return [];
    return selectedGroup.members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.includes(searchQuery)
    );
  };

  const filteredMembers = getFilteredMembers();

  // Stats
  const totalMembers = selectedGroup?.members?.length || 0;
  const presentCount = Object.values(attendanceState).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'absent').length;
  const excusedCount = Object.values(attendanceState).filter(s => s === 'excused').length;
  const unmarkedCount = totalMembers - (presentCount + absentCount + excusedCount);

  return (
    <div className="flex-1 p-4 lg:p-8 pt-6 overflow-y-auto w-full h-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            Yoklama Yönetimi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dinamik QR Kod ile sporcular telefon kameralarından yoklamaya katılır
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Export Attendance Report Button */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-sm text-sm"
            title="Tüm sporcu yoklama verilerini tarih aralığına göre CSV olarak indirin"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Raporu Dışa Aktar</span>
          </button>

          {/* Reminder Trigger Button */}
          {selectedGroup && (
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              title="Giriş yapmayan sporcular için veli & eğitmen hatırlatma bildirimi gönder"
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>Hatırlatma Tetikleyicisi</span>
            </button>
          )}

          {/* Dynamic QR Display Button */}
          {selectedGroup && (
            <button
              type="button"
              onClick={() => setIsDynamicQrModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm text-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Dinamik QR Kodu Göster</span>
            </button>
          )}

          {selectedGroup && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 text-sm"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Yoklamayı Kaydet</span>
            </button>
          )}
        </div>
      </div>

      {/* Unmarked / Missing Check-in Active Reminder Callout Banner */}
      {selectedGroup && (unmarkedCount > 0 || absentCount > 0) && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/40 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Yoklama Hatırlatma Uyarısı</span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-extrabold">
                  {unmarkedCount + absentCount} Sporcu Katılmadı
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Bu grupta henüz yoklamaya girmemiş veya gelmedi olarak işaretlenmiş sporcular var. Velilere otomatik SMS/Push hatırlatması tetikleyebilirsiniz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hatırlatma Bildirimi Gönder</span>
          </button>
        </div>
      )}

      {/* Select Group & Date Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 p-5 mb-6 flex flex-col md:flex-row gap-5 items-end">
        {/* Group Selector */}
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
            Grup / Takım Seçimi
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <Users className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {selectedGroup ? selectedGroup.name : 'Bir grup veya takım seçin...'}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {gruplar.map((grup) => (
                  <button
                    key={grup.id}
                    onClick={() => handleGroupSelect(grup)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0 text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{grup.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{grup.branch} • {grup.instructorName}</div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {grup.memberCount} Sporcu
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Selector */}
        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
            Yoklama Tarihi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Attendance Area */}
      {selectedGroup ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
          
          {/* Top Controls: Search & Bulk Actions */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-slate-50/50">
            {/* Search */}
            <div className="relative w-full xl:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="İsim veya sporcu no ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            {/* Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
              <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">Toplu İşlem:</span>
              <button
                onClick={() => markAllAs('present')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs transition-colors border border-emerald-200/50"
              >
                <CheckCircle className="w-4 h-4" />
                Herkes Geldi
              </button>
              <button
                onClick={() => markAllAs('absent')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-xs transition-colors border border-rose-200/50"
              >
                <XCircle className="w-4 h-4" />
                Herkes Gelmedi
              </button>
              <button
                onClick={() => markAllAs(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium text-xs transition-colors border border-slate-200/80 ml-auto xl:ml-0"
              >
                Sıfırla
              </button>
            </div>
          </div>
          
          {/* Stats Bar with Automated SporPuan Summary */}
          <div className="flex flex-wrap items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 bg-white text-center">
            <div className="flex-1 min-w-[70px] py-3 px-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mevcut</div>
              <div className="text-base sm:text-lg font-bold text-slate-800">{totalMembers}</div>
            </div>
            <div className="flex-1 min-w-[70px] py-3 px-2">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Katıldı</div>
              <div className="text-base sm:text-lg font-bold text-emerald-600">{presentCount}</div>
            </div>
            <div className="flex-1 min-w-[70px] py-3 px-2">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">Gelmedi</div>
              <div className="text-base sm:text-lg font-bold text-rose-600">{absentCount}</div>
            </div>
            <div className="flex-1 min-w-[70px] py-3 px-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bekleyen</div>
              <div className="text-base sm:text-lg font-bold text-slate-600">{unmarkedCount}</div>
            </div>
            <div className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-amber-50/60 dark:bg-amber-950/20 text-left flex items-center justify-between sm:justify-start gap-2.5 border-t sm:border-t-0 border-amber-100">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  Otomatik Sporpuan
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {presentCount > 0 ? `+${presentCount * 75} SP (Hazır)` : 'Yoklama bekleniyor'}
                </span>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const status = attendanceState[member.id];
                
                return (
                  <div 
                    key={member.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all ${
                      status === 'present' ? 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-400/20' :
                      status === 'absent' ? 'bg-rose-50/50 border-rose-200' :
                      status === 'excused' ? 'bg-amber-50/50 border-amber-200' :
                      'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Member Info & Automation Badge */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        status === 'present' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30' :
                        status === 'absent' ? 'bg-rose-100 text-rose-700' :
                        status === 'excused' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{member.name}</h3>
                          {status === 'present' && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0 animate-in fade-in">
                              <Zap className="w-2.5 h-2.5 fill-emerald-700" />
                              <span>+75 SP Otomatik</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">#{member.code}</span>
                          <span className="text-slate-400 truncate">{member.phone}</span>
                          <span className="text-[11px] text-emerald-600 font-semibold hidden md:inline">
                            • Haftalık Devam: %100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Segmented Control */}
                    <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 gap-1 select-none">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, 'present')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                        title="Geldi Olarak İşaretle (Otomatik +25 SP Katılım & +50 SP Tam Devam)"
                      >
                        <CheckCircle className={`w-3.5 h-3.5 ${status === 'present' ? 'text-white' : 'text-emerald-600'}`} />
                        <span>Geldi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, 'absent')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                        title="Gelmedi Olarak İşaretle"
                      >
                        <XCircle className={`w-3.5 h-3.5 ${status === 'absent' ? 'text-white' : 'text-rose-600'}`} />
                        <span>Gelmedi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, 'excused')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          status === 'excused'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 hover:bg-white/60 dark:hover:bg-slate-700/60'
                        }`}
                        title="İzinli / Raporlu Olarak İşaretle"
                      >
                        <MinusCircle className={`w-3.5 h-3.5 ${status === 'excused' ? 'text-white' : 'text-amber-600'}`} />
                        <span>İzinli</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Sonuç Bulunamadı</h3>
                  <p className="text-xs text-slate-500">Arama kriterinize uygun sporcu bulunamadı.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
            <ClipboardCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Yoklama Almaya Başlayın</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Lütfen yoklama almak istediğiniz grubu ve tarihi yukarıdan seçerek işlemi başlatın.
          </p>
          <button
            onClick={() => setIsDropdownOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            <span>Grup Seç</span>
          </button>
        </div>
      )}

      {/* Success Toast Notification with Automated SporPuan Highlights */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5 z-50">
          <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Yoklama Kaydedildi</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                Otomasyon Başarılı
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {selectedGroup?.name} için yoklama işlendi.
              {automationSummary && automationSummary.awardedCount > 0 && (
                <span className="block mt-1 font-semibold text-amber-300">
                   Katılan sporculara toplam +{automationSummary.totalPointsGiven} Sporpuan (Katılım &amp; Haftalık Tam Devam) otomatik olarak tanımlandı ve veli uygulamalarına iletildi!
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic QR Session Modal */}
      {selectedGroup && (
        <DynamicQrAttendanceModal
          isOpen={isDynamicQrModalOpen}
          onClose={() => setIsDynamicQrModalOpen(false)}
          group={selectedGroup}
          date={attendanceDate}
          attendanceState={attendanceState}
          onAthleteCheckedIn={(memberId) => {
            setAttendanceState((prev) => ({
              ...prev,
              [memberId]: 'present',
            }));
          }}
        />
      )}

      {/* Phone Camera Scanner Modal */}
      <QrYoklamaScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        selectedGroupMembers={selectedGroup?.members}
        onAttendanceSuccess={(memberId) => {
          setAttendanceState((prev) => ({
            ...prev,
            [memberId]: 'present',
          }));
        }}
      />

      {/* Yoklama Reminder & Automation Modal */}
      {selectedGroup && (
        <YoklamaHatirlatmaModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          selectedGroup={selectedGroup}
          attendanceDate={attendanceDate}
          attendanceState={attendanceState}
        />
      )}

      {/* Yoklama Attendance Report & CSV Export Modal */}
      <YoklamaRaporExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        gruplar={gruplar}
        currentSelectedGroup={selectedGroup}
        currentAttendanceDate={attendanceDate}
        currentAttendanceState={attendanceState}
      />
    </div>
  );
};
