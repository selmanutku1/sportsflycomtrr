export interface AntrenorNotuSablon {
  id: string;
  baslik: string;
  kategori: 'Üstün Başarı & Liderlik' | 'Gelişim & Potansiyel' | 'Disiplin & Devamlılık' | 'Takım Oyunu & Savunma' | 'Taktiksel Zeka & Oyun';
  metin: string;
  onerilenGelisimAlanlari: string[];
}

export const ANTRENOR_NOTU_KATEGORILERI = [
  'Tümü',
  'Üstün Başarı & Liderlik',
  'Gelişim & Potansiyel',
  'Disiplin & Devamlılık',
  'Takım Oyunu & Savunma',
  'Taktiksel Zeka & Oyun'
] as const;

export interface GozlemSablon {
  id: string;
  baslik: string;
  donem?: string;
  odakKonusu: string;
  durum: 'Gelişiyor' | 'Hedefe Ulaştı' | 'Örnek Davranış';
  gozlem: string;
}

export interface PuanlamaProfiliSablon {
  id: string;
  baslik: string;
  rozet: string;
  etiket?: string;
  aciklama: string;
  antrenorNotu?: string;
  katilimYuzdesi?: number;
  teknik: {
    topKontrolu: number;
    pasBasarisi: number;
    sut: number;
    topSurme: number;
    savunma: number;
    ortalama?: number;
  };
  fiziksel: {
    hiz: number;
    dayaniklilik: number;
    guc: number;
    ceviklik: number;
    ortalama?: number;
  };
  taktiksel: {
    oyunZekasi: number;
    pozisyonAlma: number;
    kararVerme: number;
    ortalama?: number;
  };
  zihinsel: {
    disiplin: number;
    ozguven: number;
    takimUyumu: number;
    liderlik: number;
    ortalama?: number;
  };
  davranissalKriterler: {
    fairPlay: number;
    sorumlulukEkipman: number;
    saygiIletisim: number;
    yonergeyeUyum: number;
    duyguKontrolu: number;
  };
}

export const HAZIR_ANTRENOR_NOTLARI: AntrenorNotuSablon[] = [
  {
    id: 'not-liderlik',
    baslik: 'Örnek Liderlik & Yüksek Disiplin',
    kategori: 'Üstün Başarı & Liderlik',
    metin: 'Dönem boyunca sergilediği yüksek antrenman disiplini, takım arkadaşlarına verdiği pozitif enerji ve maçlardaki soğukkanlı liderliğiyle örnek bir sporcu profili çizdi. Zor anlarda sorumluluk alması ve çalışma ahlakı gelişim ivmesini hızlandırıyor.',
    onerilenGelisimAlanlari: ['Tempo Kontrolü', 'Saha İçi Sesli İletişim', 'Baskı Altında Şut İstikrarı']
  },
  {
    id: 'not-potansiyel',
    baslik: 'Hızlı Gelişim & Yüksek Öğrenme Arzusu',
    kategori: 'Gelişim & Potansiyel',
    metin: 'Teknik temel becerilerinde belirgin bir sıçrama kaydedildi. Antrenör yönergelerini pürdikkat dinlemesi ve hatalarından hızla ders çıkarması en güçlü yönü. Kendine olan inancını sahaya yansıttıkça potansiyelini çok daha net ortaya koyacaktır.',
    onerilenGelisimAlanlari: ['Zayıf El / Ayak Becerisi', 'Birebirde Cesaret', 'Karar Verme Sürati']
  },
  {
    id: 'not-takim-oyunu',
    baslik: 'Özverili Takım Oyuncusu & Savunma Gücü',
    kategori: 'Takım Oyunu & Savunma',
    metin: 'Bireysel savunma gayreti, yardımlaşma bilinci ve takım oyununa sadakati takdire şayan. Görev adamı kimliğiyle takımın savunma direncini yukarı taşıyor. Hücum aksiyonlarında daha cesur girişimlerde bulunarak skor katkısını artırması hedeflenmektedir.',
    onerilenGelisimAlanlari: ['Hücum Bitiriciliği', 'Şut Mekaniği', 'Boş Alanlara Topsuz Kat']
  },
  {
    id: 'not-taktik-zeka',
    baslik: 'Üstün Oyun Zekası & Saha Görüşü',
    kategori: 'Taktiksel Zeka & Oyun',
    metin: 'Saha içi yerleşimi ve oyun vizyonu yaş grubunun oldukça üzerinde. Rakiplerin hamlelerini önceden sezerek doğru pas açılarını yakalamakta çok başarılı. Fiziksel temas gücünü artırdığında oyun temposunu tamamen kontrol edebilir.',
    onerilenGelisimAlanlari: ['İkili Mücadele Gücü', 'Patlayıcı Hız', 'Gövde Dengesi']
  },
  {
    id: 'not-odak-devamlilik',
    baslik: 'Yetenekli & Süreklilik Gerektiren Profil',
    kategori: 'Disiplin & Devamlılık',
    metin: 'Doğuştan gelen top hissiyatı ve atletik kapasitesi üst düzeyde. Antrenman devamlılığını koruduğu ve maç içi konsantrasyon dalgalanmalarını aştığı takdirde performansının zirveye ulaşacağına inancımız tamdır. Çalışmaya devam!',
    onerilenGelisimAlanlari: ['Konsantrasyon Sürekliliği', 'Savunma Geri Koşuları', 'Duygu Kontrolü']
  },
  {
    id: 'not-temel-altyapi',
    baslik: 'Temel Altyapı Kazanımı & Özgüven İnşası',
    kategori: 'Gelişim & Potansiyel',
    metin: 'Sporcumuz spor kültürünü, antrenman adabını ve temel hareket mekaniğini başarıyla benimsedi. Arkadaşlarıyla olan sıcak iletişimi ve antrenmana istekli gelişi gelişim sürecini pozitif etkiliyor.',
    onerilenGelisimAlanlari: ['Top Kontrolü Temelleri', 'Ayak Çabukluğu', 'Duruş Pozisyonu']
  }
];

export const HAZIR_GOZLEM_SABLONLARI: GozlemSablon[] = [
  {
    id: 'gozlem-sut-mekanik',
    baslik: 'Şut & Bitiricilik Mekaniği',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Şut Mekaniği ve El Bırakış Açısı',
    durum: 'Hedefe Ulaştı',
    gozlem: 'Şut formunda dirsek açısı ve ayak yerleşimi belirgin biçimde düzeldi. Baskı altında dahi formunu bozmadan isabet kaydedebiliyor.'
  },
  {
    id: 'gozlem-birebir-savunma',
    baslik: 'Birebir Savunma & Ayak Çabukluğu',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Birebir Savunma ve Kayma Adımları',
    durum: 'Gelişiyor',
    gozlem: 'Gövde dengesini koruyarak faul yapmadan rakip önünde kalma prensibini kavradı. Ayak çabukluğu drillerinde belirgin ivme yakalandı.'
  },
  {
    id: 'gozlem-pas-vizyon',
    baslik: 'Pas İsabeti & Zamanlama',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Hızlı Hücumda Pas Tercihi ve Görüş',
    durum: 'Hedefe Ulaştı',
    gozlem: 'Hızlı hücum geçişlerinde kafasını kaldırarak boştaki takım arkadaşını anında görme ve topu doğru şiddette iletme becerisi üst düzeye ulaştı.'
  },
  {
    id: 'gozlem-fair-play',
    baslik: 'Fair-Play & Karakter Duruşu',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Müsabaka Disiplini ve Hakem Saygısı',
    durum: 'Örnek Davranış',
    gozlem: 'Kritik maç anlarında ve zorlayıcı ikili temaslarda soğukkanlılığını korudu, yere düşen rakibini kaldırarak örnek centilmenlik sergiledi.'
  },
  {
    id: 'gozlem-fiziksel-direnc',
    baslik: 'Kondisyon & Maç Sonu Direnci',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Son Çeyrek / Devre Aerobik Dayanıklılık',
    durum: 'Gelişiyor',
    gozlem: 'Yoğun geçen antrenman sonlarında dahi temponun altına düşmeme gayreti sevindirici. Koşu mesafesi ve nabız toparlanma süresi optimize ediliyor.'
  },
  {
    id: 'gozlem-ekipman-sorumluluk',
    baslik: 'Ekipman ve Zaman Sorumluluğu',
    donem: '2024-2025 Gelişim',
    odakKonusu: 'Antrenmana Zamanında Hazırlık & Ekipman Düzeni',
    durum: 'Örnek Davranış',
    gozlem: 'Antrenman başlama saatinden 15 dakika önce salonda hazır bulunup bireysel ısınmasına başlıyor; su matarası ve ekipman temizliğine tam riayet ediyor.'
  }
];

export const HAZIR_PUANLAMA_PROFILLERI: PuanlamaProfiliSablon[] = [
  {
    id: 'profil-elit-yildiz',
    baslik: 'Elit Performans & Takım Lideri',
    rozet: '⭐️ 9-10 Puan Bandı',
    etiket: '⭐️ 9-10 Puan Bandı',
    aciklama: 'Kusursuz antrenman disiplini, üst düzey teknik beceri ve maç içi yüksek etki gösteren sporcular için.',
    antrenorNotu: 'Dönem boyunca sergilediği üstün liderlik ve teknik istikrarla örnek bir karneye hak kazanmıştır.',
    katilimYuzdesi: 98,
    teknik: { topKontrolu: 9, pasBasarisi: 9, sut: 9, topSurme: 9, savunma: 9, ortalama: 9.0 },
    fiziksel: { hiz: 9, dayaniklilik: 9, guc: 8, ceviklik: 9, ortalama: 8.8 },
    taktiksel: { oyunZekasi: 9, pozisyonAlma: 9, kararVerme: 9, ortalama: 9.0 },
    zihinsel: { disiplin: 10, ozguven: 9, takimUyumu: 10, liderlik: 9, ortalama: 9.5 },
    davranissalKriterler: { fairPlay: 10, sorumlulukEkipman: 10, saygiIletisim: 10, yonergeyeUyum: 10, duyguKontrolu: 9 }
  },
  {
    id: 'profil-dengeli-gelisim',
    baslik: 'İstikrarlı & Dengeli Gelişen',
    rozet: ' 7-8 Puan Bandı',
    etiket: ' 7-8 Puan Bandı',
    aciklama: 'Altyapı gereksinimlerini sağlam adımlarla yerine getiren, gelişime açık ve antrenmanlara sadık sporcular için.',
    antrenorNotu: 'Antrenman düzeni ve öğrenme isteği yüksek. Temel parametrelerde dengeli bir gelişim sürdürüyor.',
    katilimYuzdesi: 92,
    teknik: { topKontrolu: 8, pasBasarisi: 8, sut: 7, topSurme: 7, savunma: 8, ortalama: 7.6 },
    fiziksel: { hiz: 8, dayaniklilik: 7, guc: 7, ceviklik: 8, ortalama: 7.5 },
    taktiksel: { oyunZekasi: 8, pozisyonAlma: 7, kararVerme: 7, ortalama: 7.3 },
    zihinsel: { disiplin: 8, ozguven: 8, takimUyumu: 9, liderlik: 7, ortalama: 8.0 },
    davranissalKriterler: { fairPlay: 9, sorumlulukEkipman: 9, saygiIletisim: 9, yonergeyeUyum: 8, duyguKontrolu: 8 }
  },
  {
    id: 'profil-savunma-mucadele',
    baslik: 'Savunma & İkili Mücadele Uzmanı',
    rozet: '🛡️ Mücadeleci Profil',
    etiket: '🛡️ Mücadeleci Profil',
    aciklama: 'Fiziksel gücü, çevikliği ve sert savunma disiplini ön planda olan savunma odaklı sporcular için.',
    antrenorNotu: 'Mücadeleci kimliği ve savunma gayreti takımın savunma omurgasını oluşturuyor.',
    katilimYuzdesi: 95,
    teknik: { topKontrolu: 7, pasBasarisi: 8, sut: 6, topSurme: 7, savunma: 10, ortalama: 7.6 },
    fiziksel: { hiz: 8, dayaniklilik: 9, guc: 9, ceviklik: 9, ortalama: 8.8 },
    taktiksel: { oyunZekasi: 8, pozisyonAlma: 9, kararVerme: 8, ortalama: 8.3 },
    zihinsel: { disiplin: 9, ozguven: 8, takimUyumu: 9, liderlik: 8, ortalama: 8.5 },
    davranissalKriterler: { fairPlay: 9, sorumlulukEkipman: 9, saygiIletisim: 9, yonergeyeUyum: 9, duyguKontrolu: 8 }
  },
  {
    id: 'profil-hucum-yaratici',
    baslik: 'Hücum & Yaratıcı Oyun Kurucu',
    rozet: '🎯 Yaratıcı Profil',
    etiket: '🎯 Yaratıcı Profil',
    aciklama: 'Top hakimiyeti, dripling ve şut becerisi yüksek, sahada yaratıcılık üreten sporcular için.',
    antrenorNotu: 'Hücum vizyonu ve skor katkısı yüksek. Oyun temposunu belirleme becerisi dikkat çekici.',
    katilimYuzdesi: 90,
    teknik: { topKontrolu: 10, pasBasarisi: 9, sut: 9, topSurme: 9, savunma: 7, ortalama: 8.8 },
    fiziksel: { hiz: 9, dayaniklilik: 7, guc: 6, ceviklik: 9, ortalama: 7.8 },
    taktiksel: { oyunZekasi: 10, pozisyonAlma: 8, kararVerme: 9, ortalama: 9.0 },
    zihinsel: { disiplin: 8, ozguven: 9, takimUyumu: 8, liderlik: 8, ortalama: 8.3 },
    davranissalKriterler: { fairPlay: 9, sorumlulukEkipman: 8, saygiIletisim: 9, yonergeyeUyum: 8, duyguKontrolu: 8 }
  },
  {
    id: 'profil-temel-baslangic',
    baslik: 'Temel Beceri & Yeni Başlayan',
    rozet: '🌱 5-6 Puan Bandı',
    etiket: '🌱 5-6 Puan Bandı',
    aciklama: 'Temel kavramları ve antrenman düzenini yeni öğrenen, desteklenmesi gereken genç sporcular için.',
    antrenorNotu: 'Temel hareket modellerini ve takım kültürünü hızla benimsiyor. Potansiyeli umut verici.',
    katilimYuzdesi: 85,
    teknik: { topKontrolu: 6, pasBasarisi: 6, sut: 5, topSurme: 5, savunma: 6, ortalama: 5.6 },
    fiziksel: { hiz: 6, dayaniklilik: 6, guc: 5, ceviklik: 6, ortalama: 5.8 },
    taktiksel: { oyunZekasi: 5, pozisyonAlma: 5, kararVerme: 5, ortalama: 5.0 },
    zihinsel: { disiplin: 7, ozguven: 6, takimUyumu: 8, liderlik: 5, ortalama: 6.5 },
    davranissalKriterler: { fairPlay: 8, sorumlulukEkipman: 7, saygiIletisim: 9, yonergeyeUyum: 8, duyguKontrolu: 7 }
  }
];

export const HAZIR_GELISIM_ETIKETLERI = [
  'Zayıf El / Ayak Becerisi',
  'Baskı Altında Şut İstikrarı',
  'Hızlı Hücum Karar Verme',
  'Birebir Savunma Ayak Çabukluğu',
  'Saha İçi Sesli İletişim',
  'Topsuz Kat & Alan Açma',
  'Konsantrasyon Sürekliliği',
  'İkili Mücadele Gücü',
  'Patlayıcı Çıkış Hızı',
  'Ribaund / Dönen Top Takibi',
  'Duygu Kontrolü & Sakinlik',
  'Antrenman Devamlılığı'
];
