import React, { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Eye,
  EyeOff,
  UserPlus,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Check,
  Download,
  Copy,
  Plus,
} from 'lucide-react';
import { INITIAL_SPORSEPETI_USERS } from '../../data/mockData';
import { SporsepetiUserItem } from '../../types';

export const SporsepetiUserView: React.FC = () => {
  const [users, setUsers] = useState<SporsepetiUserItem[]>(INITIAL_SPORSEPETI_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTcMap, setVisibleTcMap] = useState<Record<string, boolean>>({});
  const [copiedTcId, setCopiedTcId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+90 ');
  const [newTc, setNewTc] = useState('');
  const [newCity, setNewCity] = useState('İstanbul');

  const toggleTcVisibility = (id: string) => {
    setVisibleTcMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTcId(id);
    setTimeout(() => setCopiedTcId(null), 1500);
  };

  const handleExportExcel = () => {
    setExportNotice('Sportsfly kullanıcı listesi Excel (CSV) olarak hazırlanıyor...');
    setTimeout(() => {
      // Generate CSV download
      const headers = ['Kullanıcı Adı', 'E-posta', 'Kayıt Tarihi', 'TC Kimlik', 'Telefon', 'Şehir'];
      const rows = users.map((u) => [
        u.name,
        u.email,
        u.createdAt,
        u.tcKimlik,
        u.phone,
        u.city,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Sportsfly_Kullanici_Listesi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportNotice('Excel dosyası başarıyla indirildi!');
      setTimeout(() => setExportNotice(null), 2500);
    }, 600);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newUser: SporsepetiUserItem = {
      id: `u-${Date.now()}`,
      name: newName,
      email: newEmail,
      createdAt: formattedDate,
      tcKimlik: newTc || '11111111111',
      phone: newPhone || '+90 555 000 00 00',
      city: newCity || 'İstanbul',
    };

    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('+90 ');
    setNewTc('');
    setNewCity('İstanbul');
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phone.includes(query) ||
      u.city.toLowerCase().includes(query) ||
      u.tcKimlik.includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{exportNotice}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        {/* Top Control Bar matching Screenshot 6 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Kullanıcı Ekle
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Toplam {filteredUsers.length} kullanıcı
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input matching Screenshot 6 "Sportsfly Kullanıcı Ara" */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sportsfly Kullanıcı Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Excel Button matching Screenshot 6 */}
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              title="Excel'e Aktar"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Mobile Cards for Users (<640px) */}
        <div className="block sm:hidden space-y-3 pt-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isTcVisible = visibleTcMap[user.id];
              const isCopied = copiedTcId === user.id;

              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.createdAt}</p>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {user.city || 'Belirtilmedi'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Telefon:</span>
                      <a href={`tel:${user.phone}`} className="font-medium text-slate-800 hover:text-blue-600">
                        {user.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">TC Kimlik:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-800 font-semibold">
                          {isTcVisible ? user.tcKimlik : '*******'}
                        </span>
                        <button
                          onClick={() => toggleTcVisibility(user.id)}
                          className="p-0.5 text-slate-400 hover:text-blue-600"
                          title={isTcVisible ? 'Gizle' : 'Göster'}
                        >
                          {isTcVisible ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {isTcVisible && (
                          <button
                            onClick={() => copyToClipboard(user.tcKimlik, user.id)}
                            className="p-0.5 text-slate-400 hover:text-blue-600"
                            title="Kopyala"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-600">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Table Content matching Screenshot 6 */}
        <div className="hidden sm:block overflow-x-auto pt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="pb-3 px-3">Kullanıcı</th>
                <th className="pb-3 px-3">Tc Kimlik</th>
                <th className="pb-3 px-3">Telefon Numarası</th>
                <th className="pb-3 px-3">Şehir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isTcVisible = visibleTcMap[user.id];
                  const isCopied = copiedTcId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Kullanıcı Column: Name in bold, email, and date timestamp */}
                      <td className="py-4 px-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-base">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {user.email}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {user.createdAt}
                          </p>
                        </div>
                      </td>

                      {/* Tc Kimlik Column: masked with toggle eye */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold tracking-wider text-slate-800">
                            {isTcVisible ? user.tcKimlik : '*******'}
                          </span>
                          <button
                            onClick={() => toggleTcVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                            title={isTcVisible ? 'Gizle' : 'Göster'}
                          >
                            {isTcVisible ? (
                              <EyeOff className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          {isTcVisible && (
                            <button
                              onClick={() => copyToClipboard(user.tcKimlik, user.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                              title="Kopyala"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Telefon Numarası */}
                      <td className="py-4 px-3 whitespace-nowrap text-sm font-semibold text-slate-700">
                        {user.phone}
                      </td>

                      {/* Şehir */}
                      <td className="py-4 px-3 whitespace-nowrap text-sm text-slate-600">
                        {user.city || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Arama kriterlerinize uygun kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Yeni Sporsepeti Kullanıcısı Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddUser} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Demir"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Örn: mehmet@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  placeholder="+90 5XX XXX XX XX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="11 haneli kimlik numarası"
                  value={newTc}
                  onChange={(e) => setNewTc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  placeholder="Örn: İstanbul"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Kullanıcıyı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
