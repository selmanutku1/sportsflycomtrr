import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Plus,
  Send,
  FileSpreadsheet,
  FileText,
  ThumbsUp,
  Building,
  User,
  Check,
  X,
  ExternalLink,
  ClipboardCheck,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { SporpuanReview, NavPage } from '../../../types';
import { isSuperAdminUser } from '../../../data/packagePermissions';
import { getStoredUserProfile } from '../../../data/userProfile';

interface SporpuanDegerlendirmelerViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const SporpuanDegerlendirmelerView: React.FC<SporpuanDegerlendirmelerViewProps> = ({ onNavigate }) => {
  const isSuperAdmin = isSuperAdminUser(getStoredUserProfile()?.role);
  const [reviews, setReviews] = useState<SporpuanReview[]>([
    {
      id: 'rev-1',
      authorName: 'Barış Koçak',
      authorEmail: 'baris.k@gmail.com',
      isVerifiedUser: true,
      facilityName: 'Saraçgym Nilüfer',
      branch: 'Fitness & Vücut Geliştirme',
      rating: 5,
      criteria: {
        hygiene: 5.0,
        equipment: 4.8,
        trainer: 5.0,
        priceValue: 4.7,
      },
      title: 'Tesis temizliği ve eğitmen ilgisi harika',
      comment:
        '3 aydır Saraçgym üyesiyim. Berkan Hoca bireysel antrenman programımı çok özenli hazırladı. Salon özellikle akşam yoğun saatlerde bile havalandırması ve hijyeniyle fark yaratıyor. Kesinlikle tavsiye ederim.',
      date: '08.09.2024',
      status: 'Yayında',
      helpfulCount: 14,
      reply: {
        text: 'Değerli yorumunuz ve güveniniz için teşekkür ederiz Barış Bey. Sporsepeti ve Sporpuan topluluğuna en iyi deneyimi sunmaya devam edeceğiz.',
        author: 'Saraçgym Yönetimi',
        date: '09.09.2024',
      },
    },
    {
      id: 'rev-2',
      authorName: 'Ezgi Yılmaz',
      authorEmail: 'ezgiyilmaz@gmail.com',
      isVerifiedUser: true,
      facilityName: 'DigiMondi Levent',
      branch: 'Pilates Reformer',
      rating: 4.8,
      criteria: {
        hygiene: 5.0,
        equipment: 4.9,
        trainer: 4.8,
        priceValue: 4.5,
      },
      title: 'Reformer aletleri yeni ve hijyenik',
      comment:
        'Stüdyo çok aydınlık ve ferah. Seanslar en fazla 6 kişi olduğu için eğitmen her hareketinizi tek tek düzeltiyor. Rezervasyonların Sporsepeti üzerinden anlık onaylanması büyük konfor.',
      date: '06.09.2024',
      status: 'Yayında',
      helpfulCount: 9,
    },
    {
      id: 'rev-3',
      authorName: 'Murat Yılmaz',
      authorEmail: 'murat.y@gmail.com',
      isVerifiedUser: false,
      facilityName: 'aicosports Koşuyolu',
      branch: 'Yüzme & Fonksiyonel',
      rating: 4.2,
      criteria: {
        hygiene: 4.0,
        equipment: 4.5,
        trainer: 4.4,
        priceValue: 3.9,
      },
      title: 'Havuz temizliği güzel fakat soyunma odaları yoğun',
      comment:
        'Antrenörler çok profesyonel ve güler yüzlü. Hafta sonu saat 16:00 civarı soyunma odalarında dolap bulmakta zorlandık, dolap sayısı artırılabilir. Genel olarak kaliteli bir spor okulu.',
      date: '04.09.2024',
      status: 'Yayında',
      helpfulCount: 6,
      reply: {
        text: 'Geri bildiriminiz için teşekkürler Murat Bey. Soyunma odalarımızdaki dolap ve duş alanları için genişletme çalışmalarımız planlanmıştır.',
        author: 'aicosports Operasyon',
        date: '05.09.2024',
      },
    },
    {
      id: 'rev-4',
      authorName: 'Canan Demir',
      authorEmail: 'canan.d@hotmail.com',
      isVerifiedUser: true,
      facilityName: 'DigiMondi Suadiye',
      branch: 'Yoga & Meditasyon',
      rating: 5,
      criteria: {
        hygiene: 5.0,
        equipment: 5.0,
        trainer: 5.0,
        priceValue: 4.8,
      },
      title: 'Huzurlu ortam ve uzman eğitmen kadrosu',
      comment:
        'Sabah yoga seansları günün tüm stresini alıyor. Sporpuan üzerindeki yüksek değerlendirmeleri görerek kayıt olmuştum, beklentimin çok üstünde çıktı.',
      date: '02.09.2024',
      status: 'Onay Bekliyor',
      helpfulCount: 2,
    },
    {
      id: 'rev-5',
      authorName: 'Selin Kaya',
      authorEmail: 'selin.k@gmail.com',
      isVerifiedUser: true,
      facilityName: 'Saraçgym Nilüfer',
      branch: 'Kardiyo & Fonksiyonel',
      rating: 2.5,
      criteria: {
        hygiene: 3.0,
        equipment: 2.5,
        trainer: 3.0,
        priceValue: 2.0,
      },
      title: 'Koşu bantlarından ikisi arızalıydı',
      comment:
        'Pazartesi akşamı kardiyo bölümünde sıra beklemek zorunda kaldım. Tesis yetkilileri hızlıca tamir ettireceklerini söylediler, sonucu takip edeceğim.',
      date: '28.08.2024',
      status: 'Şikayet Edildi',
      helpfulCount: 5,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [replyingReview, setReplyingReview] = useState<SporpuanReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [showNewReviewModal, setShowNewReviewModal] = useState(false);

  // New review form
  const [newAuthor, setNewAuthor] = useState('');
  const [newFacility, setNewFacility] = useState('Saraçgym Nilüfer');
  const [newBranch, setNewBranch] = useState('Fitness');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Yayında' } : r))
    );
    triggerToast('Değerlendirme onaylandı ve Sporpuan platformunda yayına alındı.');
  };

  const handleReject = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Reddedildi' } : r))
    );
    triggerToast('Değerlendirme yayından kaldırıldı.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyingReview.id
          ? {
              ...r,
              reply: {
                text: replyText,
                author: 'Kulüp Yetkilisi (SportsFly Manager)',
                date: 'Bugün',
              },
            }
          : r
      )
    );
    setReplyingReview(null);
    setReplyText('');
    triggerToast('Cevabınız değerlendirme altına başarıyla eklendi.');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone.trim()) return;
    setShowInviteModal(false);
    setInvitePhone('');
    setInviteName('');
    triggerToast('Sporcuya Sporpuan SMS değerlendirme bağlantısı gönderildi.');
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: SporpuanReview = {
      id: `rev-${Date.now()}`,
      authorName: newAuthor,
      authorEmail: 'uye@sporsepeti.com',
      isVerifiedUser: true,
      facilityName: newFacility,
      branch: newBranch,
      rating: newRating,
      criteria: {
        hygiene: newRating,
        equipment: newRating,
        trainer: newRating,
        priceValue: newRating,
      },
      title: newTitle || 'Genel Değerlendirme',
      comment: newComment,
      date: 'Bugün',
      status: 'Yayında',
      helpfulCount: 1,
    };

    setReviews([newRev, ...reviews]);
    setShowNewReviewModal(false);
    setNewAuthor('');
    setNewTitle('');
    setNewComment('');
    triggerToast('Yeni Sporpuan değerlendirmesi başarıyla eklendi.');
  };

  const handleExportCSV = () => {
    triggerToast('Sporpuan değerlendirme raporu CSV olarak indiriliyor...');
    const headers = ['Sporcu Adı', 'Tesis', 'Branş', 'Puan', 'Durum', 'Tarih', 'Yorum'];
    const rows = reviews.map((r) => [
      r.authorName,
      r.facilityName,
      r.branch,
      r.rating.toString(),
      r.status,
      r.date,
      `"${r.comment.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sporpuan_Degerlendirmeler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.authorName.toLowerCase().includes(q) ||
      r.facilityName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.branch.toLowerCase().includes(q);

    const matchesFacility =
      selectedFacility === 'Tümü' || r.facilityName.includes(selectedFacility);

    const matchesStatus =
      selectedStatus === 'Tümü' || r.status === selectedStatus;

    return matchesSearch && matchesFacility && matchesStatus;
  });

  // Calculate metrics
  const totalScore = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Sporpuan Hero Brand Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold text-[11px] uppercase tracking-wider border border-amber-400/25 flex items-center gap-1.5 shadow-2xs">
              <SportsFlyIcon className="w-3.5 h-3.5" />
              Sporpuan İtibar Portalı
            </span>
            {isSuperAdmin && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] border border-amber-400/30 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Süper Admin Yetkisiyle Açık
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              sporpuan.com Entegrasyonu
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Değerlendirmeler &amp; Sporcu Deneyimleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Sporsepeti ve SportsFly altyapısındaki spor okulları, kulüpler ve tesisler için gerçek sporcu check-in doğrulamalı şeffaf yorum ve puanlama sistemi.
          </p>
        </div>

        {/* Quick Stats on Banner */}
        <div className="w-full sm:w-auto flex items-center justify-around sm:justify-start gap-4 bg-slate-800/80 backdrop-blur-md px-4 sm:px-5 py-3 rounded-xl border border-slate-700/70 shrink-0 relative z-10">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1">
              {totalScore}
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Genel Sporpuan
            </p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div className="text-center px-2">
            <div className="text-xl sm:text-2xl font-black text-white">
              {reviews.length}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Toplam Yorum
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNewReviewModal(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Değerlendirme
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden xs:inline">Sporcuya</span> Davet Gönder
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('sporpuan-sporcu-degerlendirme')}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Sporcu Değerlendirme</span>
              </button>
            )}

            <a
              href="https://www.sporpuan.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              sporpuan.com
            </a>
          </div>

          {/* Export */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel / CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF Rapor
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Yorumlarda, sporcuda veya tesiste ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Tesis:</span>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Tümü">Tüm Tesisler &amp; Şubeler</option>
              <option value="Saraçgym">Saraçgym Nilüfer</option>
              <option value="DigiMondi">DigiMondi (Levent &amp; Suadiye)</option>
              <option value="aicosports">aicosports Koşuyolu</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Durum:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Yayında">Yayında (Onaylı)</option>
              <option value="Onay Bekliyor">Onay Bekliyor</option>
              <option value="Şikayet Edildi">Şikayet Edildi / İncelemede</option>
              <option value="Reddedildi">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const statusColors = {
              Yayında: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'Onay Bekliyor': 'bg-amber-50 text-amber-700 border-amber-200',
              'Şikayet Edildi': 'bg-rose-50 text-rose-700 border-rose-200',
              Reddedildi: 'bg-slate-100 text-slate-600 border-slate-200',
            }[review.status];

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header: Author + Verified badge + Facility + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {review.authorName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {review.authorName}
                        </span>
                        {review.isVerifiedUser && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0"
                            title="Sporpuan Check-in ve Üyelik Doğrulamalı Gerçek Sporcu"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Doğrulanmış Üye
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {review.facilityName}
                        </span>{' '}
                        • {review.branch} • {review.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-50 sm:border-t-0">
                    {/* Stars */}
                    <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/50">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              s <= Math.round(review.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-slate-800 text-xs ml-1">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors}`}
                    >
                      {review.status}
                    </span>
                  </div>
                </div>

                {/* Criteria breakdown pills (Sporpuan Metric Criteria) */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 font-medium flex items-center justify-between sm:justify-start gap-1">
                    <span>Temizlik:</span>
                    <strong className="text-slate-900">
                      {review.criteria.hygiene.toFixed(1)}/5
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 font-medium flex items-center justify-between sm:justify-start gap-1">
                    <span>Ekipman:</span>
                    <strong className="text-slate-900">
                      {review.criteria.equipment.toFixed(1)}/5
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 font-medium flex items-center justify-between sm:justify-start gap-1">
                    <span>Eğitmen:</span>
                    <strong className="text-slate-900">
                      {review.criteria.trainer.toFixed(1)}/5
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 font-medium flex items-center justify-between sm:justify-start gap-1">
                    <span>Fiyat/Perf:</span>
                    <strong className="text-slate-900">
                      {review.criteria.priceValue.toFixed(1)}/5
                    </strong>
                  </span>
                </div>

                {/* Review Text */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {review.title}
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* Existing Reply if any */}
                {review.reply && (
                  <div className="ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-blue-500 bg-blue-50/40 p-3 rounded-r-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        {review.reply.author}
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {review.reply.date}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-normal">
                      {review.reply.text}
                    </p>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{review.helpfulCount} sporcu faydalı buldu</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reply button */}
                    <button
                      onClick={() => setReplyingReview(review)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {review.reply ? 'Cevabı Düzenle' : 'Kulüp Olarak Yanıtla'}
                    </button>

                    {/* Approve button if pending */}
                    {review.status !== 'Yayında' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Yayına Al
                      </button>
                    )}

                    {/* Reject button */}
                    {review.status !== 'Reddedildi' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Arama kriterlerine uygun Sporpuan değerlendirmesi bulunamadı.
          </div>
        )}
      </div>

      {/* Modal: Yanıtla */}
      {replyingReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Değerlendirmeye Cevap Ver
              </h3>
              <button
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <div className="py-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60 my-3">
              <span className="font-bold text-slate-800 block mb-1">
                {replyingReview.authorName} ({replyingReview.facilityName})
              </span>
              <p className="text-slate-600 italic">
                &quot;{replyingReview.comment}&quot;
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resmi Kulüp Yanıtınız *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Sporcunuza nazik ve kurumsal bir teşekkür veya açıklama metni yazın..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Cevabı Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Değerlendirme Daveti Gönder */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Sporcuya Sporpuan Daveti Gönder
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="py-4 space-y-3">
              <p className="text-xs text-slate-500">
                Antrenmana katılan sporcunuza doğrudan SMS veya e-posta ile Sporpuan değerlendirme formu linki gönderilir.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sporcu Adı Soyadı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Selman Utku"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefon Numarası (SMS) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+90 5XX XXX XX XX"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-800">
                ⭐ Sporpuan SMS şablonu: &quot;Sayın sporcumuz, Saraçgym deneyiminizi sporpuan.com üzerinden 1 dakikada puanlayın, sonraki seansınızda avantaj kazanın!&quot;
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Daveti Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Yeni Değerlendirme Ekle */}
      {showNewReviewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Manuel Sporpuan Değerlendirmesi Ekle
              </h3>
              <button
                onClick={() => setShowNewReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sporcu Adı Soyadı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tesis Seçimi
                  </label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Saraçgym Nilüfer">Saraçgym Nilüfer</option>
                    <option value="DigiMondi Levent">DigiMondi Levent</option>
                    <option value="DigiMondi Suadiye">DigiMondi Suadiye</option>
                    <option value="aicosports Koşuyolu">aicosports Koşuyolu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branş
                  </label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verilen Puan (1-5)
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Çok İyi)</option>
                    <option value={3}>⭐⭐⭐ (3 - Orta)</option>
                    <option value={2}>⭐⭐ (2 - Geliştirilmeli)</option>
                    <option value={1}>⭐ (1 - Yetersiz)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yorum Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Kısa özet başlık..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yorum Metni *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Sporcu deneyimi detayları..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  Kaydet &amp; Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
