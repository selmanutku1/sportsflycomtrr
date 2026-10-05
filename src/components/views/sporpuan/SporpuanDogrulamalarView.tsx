import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Eye,
  Plus,
  Search,
  ExternalLink,
  Building,
  GraduationCap,
  QrCode,
  Check,
  X,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { SporpuanVerification } from '../../../types';
import { isSuperAdminUser } from '../../../data/packagePermissions';
import { getStoredUserProfile } from '../../../data/userProfile';

export const SporpuanDogrulamalarView: React.FC = () => {
  const isSuperAdmin = isSuperAdminUser(getStoredUserProfile()?.role);
  const [verifications, setVerifications] = useState<SporpuanVerification[]>([
    {
      id: 'v-1',
      entityType: 'Tesis',
      title: 'Spor Tesisi & Kulüp Resmi Lisansı',
      facilityName: 'Saraçgym Nilüfer',
      verificationBadge: 'Doğrulanmış Spor Tesisi (Gold Rozet)',
      submittedDate: '01.09.2024',
      status: 'Onaylandı',
      trustScore: 98,
      documentsCount: 4,
      verifiedBy: 'Sporpuan Denetim Kurulu',
    },
    {
      id: 'v-2',
      entityType: 'Eğitmen',
      title: '3. Kademe Kıdemli Vücut Geliştirme & Fitness Antrenörlük Belgesi',
      facilityName: 'Berkan Saraç (Saraçgym)',
      verificationBadge: 'Tescilli Başantrenör',
      submittedDate: '03.09.2024',
      status: 'Onaylandı',
      trustScore: 100,
      documentsCount: 3,
      verifiedBy: 'Sporpuan Denetim Kurulu',
    },
    {
      id: 'v-3',
      entityType: 'Tesis',
      title: 'Belediye İşletme İzni & Hijyen Sertifikası',
      facilityName: 'DigiMondi Levent Stüdyosu',
      verificationBadge: 'Doğrulanmış Hijyenik Tesis',
      submittedDate: '05.09.2024',
      status: 'Onaylandı',
      trustScore: 95,
      documentsCount: 2,
      verifiedBy: 'Sporpuan Denetim Kurulu',
    },
    {
      id: 'v-4',
      entityType: 'Eğitmen',
      title: 'Reformer Pilates Eğitmenlik Sertifikası',
      facilityName: 'Ezgi Yılmaz (DigiMondi)',
      verificationBadge: 'Sertifikalı Pilates Eğitmeni',
      submittedDate: '07.09.2024',
      status: 'İncelemede',
      trustScore: 84,
      documentsCount: 2,
    },
    {
      id: 'v-5',
      entityType: 'Kullanıcı Check-in',
      title: 'Turnike QR Geçiş Doğrulamalı Üyelik',
      facilityName: 'aicosports Koşuyolu - Barış Koçak',
      verificationBadge: 'Aktif Sporcu Check-in Onayı',
      submittedDate: '08.09.2024',
      status: 'Onaylandı',
      trustScore: 100,
      documentsCount: 1,
      verifiedBy: 'Sporsepeti Akıllı Turnike API',
    },
    {
      id: 'v-6',
      entityType: 'Tesis',
      title: 'Yüzme Havuzu Kimyasal Ölçüm & Cankurtaran Belgesi',
      facilityName: 'aicosports Koşuyolu',
      verificationBadge: 'Güvenli Havuz Akreditasyonu',
      submittedDate: '09.09.2024',
      status: 'Belge Bekleniyor',
      trustScore: 70,
      documentsCount: 1,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Document view modal
  const [viewingItem, setViewingItem] = useState<SporpuanVerification | null>(null);
  const [showNewVerificationModal, setShowNewVerificationModal] = useState(false);

  // New verification form
  const [newTitle, setNewTitle] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newType, setNewType] = useState<'Tesis' | 'Eğitmen' | 'Kullanıcı Check-in'>('Tesis');
  const [newBadge, setNewBadge] = useState('Doğrulanmış Spor Tesisi');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApprove = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'Onaylandı',
              trustScore: 100,
              verifiedBy: 'Sporpuan Yetkilisi (SportsFly)',
            }
          : v
      )
    );
    triggerToast('Doğrulama başarıyla onaylandı ve Sporpuan Güven Rozeti atandı.');
  };

  const handleReject = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'Reddedildi', trustScore: 0 } : v
      )
    );
    triggerToast('Doğrulama reddedildi.');
  };

  const handleCreateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFacility.trim()) return;

    const newV: SporpuanVerification = {
      id: `v-${Date.now()}`,
      entityType: newType,
      title: newTitle,
      facilityName: newFacility,
      verificationBadge: newBadge,
      submittedDate: 'Bugün',
      status: 'İncelemede',
      trustScore: 85,
      documentsCount: 2,
    };

    setVerifications([newV, ...verifications]);
    setShowNewVerificationModal(false);
    setNewTitle('');
    setNewFacility('');
    triggerToast('Yeni doğrulama başvurusu incelemeye alındı.');
  };

  const filtered = verifications.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      v.title.toLowerCase().includes(q) ||
      v.facilityName.toLowerCase().includes(q) ||
      v.verificationBadge.toLowerCase().includes(q);

    const matchType = selectedType === 'Tümü' || v.entityType === selectedType;
    const matchStatus = selectedStatus === 'Tümü' || v.status === selectedStatus;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Sporpuan Güven &amp; Akreditasyon
            </span>
            {isSuperAdmin && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center gap-1 shadow-2xs backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Süper Admin Yetkisiyle Açık
              </span>
            )}
            <span className="text-xs text-blue-200 font-medium">
              sporpuan.com Rozet Doğrulama Sistemi
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Tesis, Eğitmen ve Check-in Doğrulamaları
          </h1>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            Sporcuların ve velilerin güvenle tercih yapabilmesi için resmi belgeler, federasyon antrenörlük lisansları ve spor okulu ruhsatları Sporpuan tarafından doğrulanır.
          </p>
        </div>

        {/* Badge summary */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shrink-0">
          <div className="text-center px-2">
            <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
              %94
            </div>
            <p className="text-[11px] text-blue-100 font-medium mt-0.5">
              Ortalama Güven Skoru
            </p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl font-black text-white">
              {verifications.filter((v) => v.status === 'Onaylandı').length}
            </div>
            <p className="text-[11px] text-blue-100 font-medium mt-0.5">
              Aktif Doğrulama
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewVerificationModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Doğrulama Başlat
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <SportsFlyIcon className="w-4 h-4" />
            <span>Doğrulanmış rozetler sporpuan.com aramalarında 3 kat daha fazla görüntülenir.</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tesis, eğitmen veya belge ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Kategori:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="Tümü">Tümü (Tesis / Eğitmen / Check-in)</option>
              <option value="Tesis">Spor Tesisi &amp; Kulüp</option>
              <option value="Eğitmen">Eğitmen Lisansı</option>
              <option value="Kullanıcı Check-in">Kullanıcı Check-in</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Durum:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="İncelemede">İncelemede</option>
              <option value="Belge Bekleniyor">Belge Bekleniyor</option>
              <option value="Reddedildi">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Verifications */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/70">
                <th className="py-3 px-4">Doğrulama Türü</th>
                <th className="py-3 px-4">Tesis / Eğitmen</th>
                <th className="py-3 px-4">Kazanılan Sporpuan Rozeti</th>
                <th className="py-3 px-4 text-center">Güven Skoru</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const badgeIcon = {
                  Tesis: <Building className="w-4 h-4 text-blue-600" />,
                  Eğitmen: <GraduationCap className="w-4 h-4 text-emerald-600" />,
                  'Kullanıcı Check-in': <QrCode className="w-4 h-4 text-purple-600" />,
                }[item.entityType];

                const statusBadge = {
                  Onaylandı: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  İncelemede: 'bg-blue-50 text-blue-700 border-blue-200',
                  'Belge Bekleniyor': 'bg-amber-50 text-amber-700 border-amber-200',
                  Reddedildi: 'bg-rose-50 text-rose-700 border-rose-200',
                }[item.status];

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Entity Type & Title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {badgeIcon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {item.title}
                          </p>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.documentsCount} Resmi Belge • {item.submittedDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Facility / Trainer */}
                    <td className="py-4 px-4 font-semibold text-slate-800 text-sm">
                      {item.facilityName}
                    </td>

                    {/* Badge */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                        <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        {item.verificationBadge}
                      </span>
                    </td>

                    {/* Trust Score */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        %{item.trustScore}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Belgeleri ve Detayları İncele"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {item.status !== 'Onaylandı' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                            title="Onayla ve Rozeti Aktifleştir"
                          >
                            <Check className="w-3 h-3" />
                            Onayla
                          </button>
                        )}

                        {item.status !== 'Reddedildi' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Reddet"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Belge İnceleme */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Doğrulama Dosyası Detayları
              </h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  {viewingItem.title}
                </h4>
                <p className="text-xs text-blue-800 font-semibold">
                  Tesis / Başvuru Sahibi: {viewingItem.facilityName}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-white text-blue-800 rounded border border-blue-200">
                    Rozet: {viewingItem.verificationBadge}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded">
                    Güven Skoru: %{viewingItem.trustScore}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">
                  İbraz Edilen Doğrulama Belgeleri:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      1. Resmi Tescil ve Federasyon Ruhsatı.pdf
                    </span>
                    <span className="text-emerald-600 font-bold">Onaylı (E-Devlet Barkodlu)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      2. Hijyen &amp; Dezenfeksiyon Uygunluk Belgesi.pdf
                    </span>
                    <span className="text-emerald-600 font-bold">Onaylı (İl Sağlık Müd.)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      3. İlk Yardım &amp; Can Güvenliği Protokolü.pdf
                    </span>
                    <span className="text-blue-600 font-bold">İncelendi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Kapat
              </button>
              {viewingItem.status !== 'Onaylandı' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(viewingItem.id);
                    setViewingItem(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Doğrulamayı Onayla
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Yeni Doğrulama Başlat */}
      {showNewVerificationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Yeni Sporpuan Doğrulama Talebi
              </h3>
              <button
                onClick={() => setShowNewVerificationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateVerification} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doğrulama Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2. Kademe Pilates Antrenörlük Belgesi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tesis / Eğitmen Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Saraçgym Nilüfer"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="Tesis">Spor Tesisi</option>
                    <option value="Eğitmen">Eğitmen</option>
                    <option value="Kullanıcı Check-in">Check-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Atanacak Rozet
                  </label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewVerificationModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Talebi Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
