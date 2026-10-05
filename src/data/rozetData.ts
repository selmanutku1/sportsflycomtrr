export interface DavranissalRozet {
  id: string;
  baslik: string;
  kategori: 'Karakter & Etik' | 'Disiplin & Sorumluluk' | 'Sağlık & Yaşam Tarzı' | 'Liderlik & Sosyal';
  aciklama: string;
  onemDerecesi: 'Standart' | 'Özel Başarı' | 'Üstün Karakter';
  ikon: 'ShieldCheck' | 'Users' | 'Clock' | 'ShieldAlert' | 'Smartphone' | 'Brain' | 'Crown' | 'SportsFlyIcon' | 'Compass' | 'Zap' | 'HeartHandshake' | 'Moon';
  renkTema: {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    activeBorder: string;
  };
}

export const KURUMSAL_ROZET_KATEGORILERI = [
  'Tümü',
  'Karakter & Etik',
  'Disiplin & Sorumluluk',
  'Sağlık & Yaşam Tarzı',
  'Liderlik & Sosyal'
] as const;

export const KURUMSAL_ROZETLER: DavranissalRozet[] = [
  {
    id: 'rozet-fairplay',
    baslik: 'Fair-Play & Centilmenlik',
    kategori: 'Karakter & Etik',
    aciklama: 'Rakibe ve hakem kararlarına her koşulda saygılı, dürüst ve centilmen saha içi tutumu.',
    onemDerecesi: 'Üstün Karakter',
    ikon: 'ShieldCheck',
    renkTema: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/80',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200'
    }
  },
  {
    id: 'rozet-takim-ruhu',
    baslik: 'Takım Ruhu & Yardımlaşma',
    kategori: 'Liderlik & Sosyal',
    aciklama: 'Arkadaşlarını motive eden, hata anında moral veren birleştirici ve yapıcı takımdaşlık.',
    onemDerecesi: 'Özel Başarı',
    ikon: 'Users',
    renkTema: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200/80',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      activeBorder: 'border-blue-500 ring-2 ring-blue-200'
    }
  },
  {
    id: 'rozet-dakiklik',
    baslik: 'Zaman Yönetimi & Dakiklik',
    kategori: 'Disiplin & Sorumluluk',
    aciklama: 'Antrenman ve kulüp etkinliklerine vaktinden önce hazır bulunma ve takvim disiplini.',
    onemDerecesi: 'Standart',
    ikon: 'Clock',
    renkTema: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200/80',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      activeBorder: 'border-purple-500 ring-2 ring-purple-200'
    }
  },
  {
    id: 'rozet-temiz-spor',
    baslik: 'Sağlıklı Yaşam & Sporcu Disiplini',
    kategori: 'Sağlık & Yaşam Tarzı',
    aciklama: 'Zararlı maddelerden, tütünden ve aşırı enerji içeceklerinden uzak duran bilinçli sporcu duruşu.',
    onemDerecesi: 'Üstün Karakter',
    ikon: 'ShieldAlert',
    renkTema: {
      bg: 'bg-teal-50/70',
      border: 'border-teal-200/80',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      activeBorder: 'border-teal-500 ring-2 ring-teal-200'
    }
  },
  {
    id: 'rozet-dijital-denge',
    baslik: 'Dijital Denge & Ekran Hijyeni',
    kategori: 'Sağlık & Yaşam Tarzı',
    aciklama: 'Maç ve antrenman öncesi telefon kullanımını sınırlandıran, oyun süresini kontrol altında tutan irade.',
    onemDerecesi: 'Özel Başarı',
    ikon: 'Smartphone',
    renkTema: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200/80',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-200'
    }
  },
  {
    id: 'rozet-gelisime-aciklik',
    baslik: 'Gelişime Açıklık & Dinleme',
    kategori: 'Disiplin & Sorumluluk',
    aciklama: 'Antrenör tavsiyelerini ve mola direktiflerini dikkatle dinleyip hızla oyuna yansıtan koçluk uyumu.',
    onemDerecesi: 'Standart',
    ikon: 'Brain',
    renkTema: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200/80',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      activeBorder: 'border-amber-500 ring-2 ring-amber-200'
    }
  },
  {
    id: 'rozet-liderlik',
    baslik: 'Kaptan Ruhu & Saha İçi Liderlik',
    kategori: 'Liderlik & Sosyal',
    aciklama: 'Zor maç anlarında sorumluluk alan, takım arkadaşlarını cesaretlendiren ve yönlendiren karakter.',
    onemDerecesi: 'Üstün Karakter',
    ikon: 'Crown',
    renkTema: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200/80',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      activeBorder: 'border-rose-500 ring-2 ring-rose-200'
    }
  },
  {
    id: 'rozet-ekipman-duzen',
    baslik: 'Ekipman & Soyunma Odası Düzeni',
    kategori: 'Disiplin & Sorumluluk',
    aciklama: 'Kulüp malzemelerine, soyunma odasına, temizliğe ve spor tesislerine titizlikle sahip çıkma bilinci.',
    onemDerecesi: 'Standart',
    ikon: 'SportsFlyIcon',
    renkTema: {
      bg: 'bg-slate-50/90',
      border: 'border-slate-300/80',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-800',
      iconBg: 'bg-slate-200',
      iconColor: 'text-slate-700',
      activeBorder: 'border-slate-500 ring-2 ring-slate-200'
    }
  },
  {
    id: 'rozet-duygu-kontrolu',
    baslik: 'Duygu Kontrolü & Soğukkanlılık',
    kategori: 'Karakter & Etik',
    aciklama: 'Provokasyonlara kapılmadan, maç temposunda sükunetini, nezaketini ve odaklanmasını koruyabilme.',
    onemDerecesi: 'Özel Başarı',
    ikon: 'Compass',
    renkTema: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200/80',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      activeBorder: 'border-sky-500 ring-2 ring-sky-200'
    }
  },
  {
    id: 'rozet-mucadele-azmi',
    baslik: 'Mücadele Azmi & Pes Etmeme',
    kategori: 'Karakter & Etik',
    aciklama: 'Skordan ve şartlardan bağımsız son ana kadar yüksek enerji ve pes etmeyen savaşçı ruhu.',
    onemDerecesi: 'Özel Başarı',
    ikon: 'Zap',
    renkTema: {
      bg: 'bg-orange-50/70',
      border: 'border-orange-200/80',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      activeBorder: 'border-orange-500 ring-2 ring-orange-200'
    }
  },
  {
    id: 'rozet-rol-model',
    baslik: 'Altyapı Rehberliği & Kardeşlik',
    kategori: 'Liderlik & Sosyal',
    aciklama: 'Altyapıdaki genç sporculara iyi örnek olan, kulüp içi sevgi ve dayanışma bağlarını güçlendiren duruş.',
    onemDerecesi: 'Üstün Karakter',
    ikon: 'HeartHandshake',
    renkTema: {
      bg: 'bg-violet-50/70',
      border: 'border-violet-200/80',
      badgeBg: 'bg-violet-100',
      badgeText: 'text-violet-800',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      activeBorder: 'border-violet-500 ring-2 ring-violet-200'
    }
  },
  {
    id: 'rozet-uyku-dinlenme',
    baslik: 'Uyku & Rejenerasyon Disiplini',
    kategori: 'Sağlık & Yaşam Tarzı',
    aciklama: 'Vücudunu antrenmanlara hazır tutmak için uyku saatlerine ve biyolojik dinlenmeye sadık kalma.',
    onemDerecesi: 'Standart',
    ikon: 'Moon',
    renkTema: {
      bg: 'bg-cyan-50/70',
      border: 'border-cyan-200/80',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-800',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-200'
    }
  }
];
