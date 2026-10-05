import React, { useState } from 'react';
import {
  FileText,
  Package,
  UserX,
  Award,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { NavPage } from '../../types';

interface GenericPageViewProps {
  page: NavPage;
}

export const GenericPageView: React.FC<GenericPageViewProps> = ({ page }) => {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const getPageConfig = () => {
    switch (page) {
      case 'sayfa-yonetimi':
        return {
          title: 'Sayfa Yönetimi',
          subtitle: 'Sporsepeti portalında yayınlanan statik ve dinamik içerik sayfaları',
          icon: FileText,
          btnText: 'Yeni Sayfa Oluştur',
          items: [
            { id: '1', name: 'Hakkımızda', slug: '/hakkimizda', status: 'Yayında', date: '01.08.2024' },
            { id: '2', name: 'Kullanım Koşulları', slug: '/kullanim-kosullari', status: 'Yayında', date: '15.08.2024' },
            { id: '3', name: 'Gizlilik ve Güvenlik', slug: '/gizlilik', status: 'Yayında', date: '20.08.2024' },
            { id: '4', name: 'İletişim & Destek', slug: '/iletisim', status: 'Yayında', date: '02.09.2024' },
          ],
        };
      case 'paket-yonetimi':
        return {
          title: 'Paket Yönetimi',
          subtitle: 'Kullanıcı ve spor kulübü üyelik paketleri, fiyatlandırma ve yetkiler',
          icon: Package,
          btnText: 'Yeni Paket Ekle',
          items: [
            { id: '1', name: 'Başlangıç Paket', slug: '7 Kullanıcı Dahil', status: 'Aktif', date: 'Aylık ₺1.250' },
            { id: '2', name: 'Standart Paket', slug: '15 Kullanıcı Dahil', status: 'Aktif', date: 'Aylık ₺2.450' },
            { id: '3', name: 'Premium Paket', slug: '50 Kullanıcı Dahil', status: 'Aktif', date: 'Aylık ₺4.900' },
            { id: '4', name: 'Profesyonel Paket', slug: 'Limitsiz Kullanıcı', status: 'Aktif', date: 'Aylık ₺8.500' },
          ],
        };
      case 'tanimsiz-kullanicilar':
        return {
          title: 'Tanımsız Kullanıcılar',
          subtitle: 'Herhangi bir spor kulübüne henüz atanmamış kullanıcılar',
          icon: UserX,
          btnText: 'Toplu Atama Yap',
          items: [
            { id: '1', name: 'Murat Yılmaz', slug: 'murat.y@gmail.com', status: 'Beklemede', date: '08.09.2024' },
            { id: '2', name: 'Selin Kaya', slug: 'selin.k@hotmail.com', status: 'Beklemede', date: '09.09.2024' },
            { id: '3', name: 'Ahmet Çetin', slug: 'ahmet.c@outlook.com', status: 'İnceleniyor', date: '10.09.2024' },
          ],
        };
      case 'kullanici-sozlesmeleri':
        return {
          title: 'Kulüp Sözleşmeleri',
          subtitle: 'Spor kulüpleri, spor okulları ve yöneticiler için kurumsal sözleşmeler',
          icon: FileText,
          btnText: 'Yeni Kulüp Sözleşmesi Ekle',
          items: [
            { id: '1', name: 'KVKK Açık Rıza Metni v2.4', slug: 'Tüm Kullanıcılar', status: 'Zorunlu', date: '01.01.2024' },
            { id: '2', name: 'Sporcu Üyelik Sözleşmesi v1.9', slug: 'Sporcular', status: 'Zorunlu', date: '15.02.2024' },
            { id: '3', name: 'Eğitmen Hizmet Sözleşmesi v3.0', slug: 'Eğitmenler', status: 'Zorunlu', date: '01.06.2024' },
          ],
        };
      case 'brans-yonetimi':
        return {
          title: 'Branş Yönetimi',
          subtitle: 'Sistemde kayıtlı spor branşları, kategoriler ve kotalar',
          icon: Award,
          btnText: 'Yeni Branş Ekle',
          items: [
            { id: '1', name: 'Futbol', slug: '23 Aktif Tesis', status: 'Aktif', date: 'Kategori: Takım Sporu' },
            { id: '2', name: 'Fitness & Vücut Geliştirme', slug: '7 Aktif Tesis', status: 'Aktif', date: 'Kategori: Bireysel' },
            { id: '3', name: 'Pilates & Reformer', slug: '5 Aktif Tesis', status: 'Aktif', date: 'Kategori: Stüdyo' },
            { id: '4', name: 'Yüzme', slug: '4 Aktif Tesis', status: 'Aktif', date: 'Kategori: Su Sporları' },
            { id: '5', name: 'Yoga & Meditasyon', slug: '1 Aktif Tesis', status: 'Aktif', date: 'Kategori: Wellness' },
            { id: '6', name: 'Voleybol', slug: '1 Aktif Tesis', status: 'Aktif', date: 'Kategori: Takım Sporu' },
          ],
        };
      case 'aktivite-yonetimi':
        return {
          title: 'Aktivite Yönetimi',
          subtitle: 'Kulüplerin haftalık ders programları, salon rezervasyonları ve seanslar',
          icon: Activity,
          btnText: 'Yeni Aktivite Planla',
          items: [
            { id: '1', name: 'Fonksiyonel Antrenman', slug: 'DigiMondi Salon 1', status: 'Yayında', date: 'Haftada 3 Gün' },
            { id: '2', name: 'Pilates Reformer Seansı', slug: 'Saraçgym Stüdyo', status: 'Yayında', date: 'Haftada 4 Gün' },
            { id: '3', name: 'Temel Yüzme Eğitimi', slug: 'Olimpik Havuz', status: 'Yayında', date: 'Hafta Sonu' },
          ],
        };
      default:
        return {
          title: 'Yönetim Sayfası',
          subtitle: 'Sporsepeti portal modülü',
          icon: FileText,
          btnText: 'Yeni Ekle',
          items: [],
        };
    }
  };

  const config = getPageConfig();
  const Icon = config.icon;

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{config.title}</h2>
              <p className="text-xs text-slate-500">{config.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <button
              onClick={() => showToast(`${config.btnText} işlemi başlatıldı.`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {config.btnText}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="pb-3 px-3">Başlık / Tanım</th>
                <th className="pb-3 px-3">Detay / Konum</th>
                <th className="pb-3 px-3">Durum</th>
                <th className="pb-3 px-3">Bilgi / Tarih</th>
                <th className="pb-3 px-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-3 font-bold text-slate-800">{item.name}</td>
                  <td className="py-4 px-3 text-slate-500 font-mono text-xs">{item.slug}</td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-600 text-xs font-medium">{item.date}</td>
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={() => showToast(`${item.name} düzenleme ekranı açıldı.`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
