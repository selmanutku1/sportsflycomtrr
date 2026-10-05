import React, { useState } from 'react';
import { Sparkles, Share2, Copy, Check, Users, Gift, TrendingUp, Phone, UserCheck, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { getStoredUserProfile } from '../../../data/userProfile';

interface ReferralItem {
  id: string;
  athleteName: string;
  branch: string;
  parentPhone: string;
  registrationDate: string;
  status: 'Aktif & Düzenli Ödeme' | 'Beklemede' | 'İptal';
  discountRate: string;
  monthlyDiscountAmount: number;
}

const INITIAL_REFERRALS: ReferralItem[] = [
  {
    id: 'ref-1',
    athleteName: 'Caner Yılmaz',
    branch: 'Basketbol U14',
    parentPhone: '0532 555 1234',
    registrationDate: '01.09.2024',
    status: 'Aktif & Düzenli Ödeme',
    discountRate: '%20',
    monthlyDiscountAmount: 600,
  },
  {
    id: 'ref-2',
    athleteName: 'Zeynep Demir',
    branch: 'Voleybol Yıldız',
    parentPhone: '0533 444 5678',
    registrationDate: '10.09.2024',
    status: 'Aktif & Düzenli Ödeme',
    discountRate: '%20',
    monthlyDiscountAmount: 600,
  },
];

export const ReferralProgramView: React.FC<{ onNavigate?: (page: any) => void }> = ({ onNavigate }) => {
  const userProfile = getStoredUserProfile();
  const isVeli = (userProfile.role || '').toLowerCase().includes('veli') || (userProfile.role || '').toLowerCase().includes('ebeveyn');

  const [referrals, setReferrals] = useState<ReferralItem[]>(INITIAL_REFERRALS);
  const [copied, setCopied] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthletePhone, setNewAthletePhone] = useState('');
  const [newAthleteBranch, setNewAthleteBranch] = useState('Basketbol');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Generate unique referral link based on user name/phone
  const uniqueRefCode = `SF-REF-${(userProfile.name || 'veli').replace(/\s+/g, '').toUpperCase()}-2026`;
  const referralLink = `https://sportsfly.club/on-kayit?ref_code=${uniqueRefCode}&ref_name=${encodeURIComponent(userProfile.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Merhaba! SportsFly Spor Kulübü'ne katıldım ve harika antrenmanlar yapıyoruz. Sen de bu özel davet linkimizle kayıt olarak aramıza katılabilirsin: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSimulateNewReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteName.trim() || !newAthletePhone.trim()) return;

    const newItem: ReferralItem = {
      id: `ref-${Date.now()}`,
      athleteName: newAthleteName.trim(),
      branch: newAthleteBranch,
      parentPhone: newAthletePhone.trim(),
      registrationDate: new Date().toLocaleDateString('tr-TR'),
      status: 'Aktif & Düzenli Ödeme',
      discountRate: '%20',
      monthlyDiscountAmount: 600,
    };

    setReferrals([newItem, ...referrals]);
    setNewAthleteName('');
    setNewAthletePhone('');
    setShowAddModal(false);
    setSuccessMsg('Yeni arkadaş tavsiyesi sisteme otomatik eşlendi ve %20 indiriminiz tanımlandı!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const totalMonthlyDiscount = referrals
    .filter(r => r.status === 'Aktif & Düzenli Ödeme')
    .reduce((acc, r) => acc + r.monthlyDiscountAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SportsFly Referans &amp; Ödül Kulübü</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Arkadaşını Tavsiye Et, Her Ay %20 Aidat İndirimi Kazan!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Özel davet linkinizi paylaşın; tavsiye ettiğiniz sporcu kulübümüze kayıt olup düzenli aidat ödemesini sürdürdüğü sürece, toplam aidatınızdan her ay otomatik olarak <strong>%20 indirim</strong> kazanın.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleWhatsAppShare}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp ile Paylaş</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold backdrop-blur-md border border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Kopyalandı!' : 'Davet Linkini Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-3 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111c2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif Tavsiyeler</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{referrals.length} Sporcu</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aylık Kazanılan İndirim</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">₺{totalMonthlyDiscount} / Ay</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam İndirim Oranı</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">%{referrals.length * 20}</p>
          </div>
        </div>
      </div>

      {/* Unique Link Box */}
      <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Size Özel Otomatik Eşleşmeli Tavsiye Linki</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bu bağlantıyı tanıdıklarınıza, akrabalarınıza veya diğer velilere gönderdiğinizde; ön kayıt sayfasında adınız ve telefon numaranız otomatik eşleşir ve kayıt tamamlandığında indiriminiz anında hesabınıza yansır.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <code className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate w-full px-2">
            {referralLink}
          </code>
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Kopyala</span>
          </button>
        </div>
      </div>

      {/* Referrals Table Section */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tavsiye Ettiğiniz Sporcular</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kulübümüze yönlendirdiğiniz ve aidat indirimi kazandığınız sporcu listesi.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>Test / Manuel Eşleşme Ekle</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-6">Sporcu Adı</th>
                <th className="py-3.5 px-6">Branş &amp; Grup</th>
                <th className="py-3.5 px-6">Veli Telefonu</th>
                <th className="py-3.5 px-6">Kayıt Tarihi</th>
                <th className="py-3.5 px-6">Durum &amp; İndirim</th>
                <th className="py-3.5 px-6 text-right">Aylık İndirim Tutarı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {ref.athleteName.charAt(0)}
                    </div>
                    <span>{ref.athleteName}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      {ref.branch}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ref.parentPhone}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{ref.registrationDate}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{ref.status} ({ref.discountRate})</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    -₺{ref.monthlyDiscountAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Tavsiye Eşleşmesi Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSimulateNewReferral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sporcu Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  placeholder="Örn: Kerem Sönmez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sporcu / Veli Telefonu (Otomatik Eşleşme)</label>
                <input
                  type="text"
                  required
                  value={newAthletePhone}
                  onChange={(e) => setNewAthletePhone(e.target.value)}
                  placeholder="0532 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Spor Branşı</label>
                <select
                  value={newAthleteBranch}
                  onChange={(e) => setNewAthleteBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                >
                  <option value="Basketbol">Basketbol</option>
                  <option value="Voleybol">Voleybol</option>
                  <option value="Yüzme">Yüzme</option>
                  <option value="Futbol">Futbol</option>
                  <option value="Jimnastik">Jimnastik</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Eşleştir &amp; İndirimi Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
