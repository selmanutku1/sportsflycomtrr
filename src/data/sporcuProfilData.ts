export interface SporcuProfil {
  id: string;
  sporcuKodu: string;
  kimlik: {
    tcKimlik: string;
    adSoyad: string;
    dogumTarihi: string;
    dogumYeri: string;
    yas: number;
    cinsiyet: 'Erkek' | 'Kız';
    kanGrubu: string;
    uyruk: string;
    okul: string;
    sinif: string;
    ogrenciNo: string;
    lisansNo: string;
    lisansTuru: string;
    brans: string;
    mevki: string;
    baskinTaraf: string;
    formaNo: number;
    kulup: string;
    takimGrup: string;
    kayitTarihi: string;
    durum: 'Aktif' | 'Pasif' | 'Donduruldu' | 'Sakat';
    fotoUrl?: string;
  };
  galeri?: {
    id: string;
    url: string;
    title: string;
    date: string;
    category: string;
  }[];
  veli: {
    anneAdSoyad: string;
    anneTelefon: string;
    anneMeslek: string;
    babaAdSoyad: string;
    babaTelefon: string;
    babaMeslek: string;
    birincilIletisim: 'Anne' | 'Baba' | 'Vasi';
    veliEposta: string;
    evAdresi: string;
    ilIlce: string;
    acilDurumKisi: string;
    acilDurumTelefon: string;
    acilDurumYakinlik: string;
  };
  saglik: {
    boy: number;
    kilo: number;
    bki: number;
    kanGrubu: string;
    saglikRaporuTarihi: string;
    saglikRaporuGecerlilik: string;
    raporDurumu: 'Gecerli' | 'Yenilenmeli' | 'Eksik';
    alerjiler: string[];
    kronikRahatsizliklar: string[];
    kullanilanIlaclar: string[];
    gecirilmisSakatliklar: {
      tarih: string;
      teshis: string;
      durum: string;
    }[];
    acilMudahaleOnayi: boolean;
    sigortaSirketi: string;
    sigortaPoliceNo: string;
  };
  performans: {
    teknikPuan: number;
    fizikselPuan: number;
    taktikselPuan: number;
    zihinselPuan: number;
    genelOrtalama: number;
    antrenorGorus: string;
    gucluYonler: string[];
    gelisimAlanlari: string[];
    fizikselTestler: {
      testAdi: string;
      sonuc: string;
      hedef: string;
      durum: 'Iyi' | 'Orta' | 'Gelistirilmeli';
    }[];
    rozetler: {
      baslik: string;
      kategori: string;
      tarih: string;
    }[];
  };
  yoklama: {
    katilimYuzdesi: number;
    toplamAntrenman: number;
    katildigiAntrenman: number;
    mazeretliDevamsizlik: number;
    mazeretsizDevamsizlik: number;
    sonKayitlar: {
      tarih: string;
      saat: string;
      baslik: string;
      durum: 'Katildi' | 'Mazeretli' | 'Gelmedi' | 'Gec Kaldi';
      not?: string;
    }[];
  };
  finans: {
    paketAdi: string;
    aylikAidat: number;
    odemePlani: string;
    sonOdemeTarihi: string;
    sonrakiOdemeTarihi: string;
    bakiyeDurumu: number;
    durum: 'Guncel' | 'Odeme Bekleniyor' | 'Gecikmis';
    odemeler: {
      id: string;
      donem: string;
      tutar: number;
      odemeTarihi: string;
      makbuzNo: string;
      yontem: string;
      durum: 'Odendi' | 'Bekliyor';
    }[];
  };
  notlarVeBelgeler: {
    notlar: {
      id: string;
      yazar: string;
      unvan: string;
      tarih: string;
      icerik: string;
      kategori: string;
    }[];
    belgeler: {
      id: string;
      ad: string;
      tur: string;
      yuklenmeTarihi: string;
      boyut: string;
      durum: 'Onaylandi' | 'Beklemede';
    }[];
  };
}

export const INITIAL_SPORCU_PROFILLERI: Record<string, SporcuProfil> = {
  's-1': {
    id: 's-1',
    sporcuKodu: '422162',
    kimlik: {
      tcKimlik: '28491029412',
      adSoyad: 'Selman Utku',
      dogumTarihi: '14.05.2008',
      dogumYeri: 'İstanbul / Kadıköy',
      yas: 16,
      cinsiyet: 'Erkek',
      kanGrubu: 'A Rh+',
      uyruk: 'T.C.',
      okul: 'Atatürk Anadolu Lisesi',
      sinif: '10-B',
      ogrenciNo: '448',
      lisansNo: 'TR-IST-2024-42216',
      lisansTuru: 'TBF Yarışmacı Kulüp Lisansı',
      brans: 'Basketbol',
      mevki: 'Oyun Kurucu (Point Guard)',
      baskinTaraf: 'Sağ El',
      formaNo: 7,
      kulup: 'DigiMondi',
      takimGrup: 'U16 Basketbol A Takımı',
      kayitTarihi: '04.09.2023',
      durum: 'Aktif',
      fotoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
    },
    galeri: [
      {
        id: 'sg-1',
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
        title: 'U16 Sezon Açılışı İdmanı',
        date: '14.09.2024',
        category: 'Antrenman',
      },
      {
        id: 'sg-2',
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
        title: 'İstanbul Şampiyonası Kupa Sevinci',
        date: '02.06.2024',
        category: 'Kupa & Madalya',
      },
      {
        id: 'sg-3',
        url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1000&auto=format&fit=crop&q=80',
        title: 'Birebir Oyun Kurucu Bitirişleri',
        date: '08.09.2024',
        category: 'Antrenman',
      },
    ],
    veli: {
      anneAdSoyad: 'Ayşe Utku',
      anneTelefon: '+90 532 210 44 88',
      anneMeslek: 'Mimar',
      babaAdSoyad: 'Kemal Utku',
      babaTelefon: '+90 538 597 92 22',
      babaMeslek: 'Makine Mühendisi',
      birincilIletisim: 'Baba',
      veliEposta: 'selmanutkumarmara@gmail.com',
      evAdresi: 'Bağdat Caddesi No: 142 Daire: 6 Kadıköy',
      ilIlce: 'İstanbul / Kadıköy',
      acilDurumKisi: 'Kemal Utku',
      acilDurumTelefon: '+90 538 597 92 22',
      acilDurumYakinlik: 'Baba',
    },
    saglik: {
      boy: 178,
      kilo: 66,
      bki: 20.8,
      kanGrubu: 'A Rh+',
      saglikRaporuTarihi: '15.09.2024',
      saglikRaporuGecerlilik: '15.09.2025',
      raporDurumu: 'Gecerli',
      alerjiler: ['Polen', 'Penisilin (Şüpheli)'],
      kronikRahatsizliklar: ['Bulunmuyor'],
      kullanilanIlaclar: ['Mevsimsel Antihistaminik'],
      gecirilmisSakatliklar: [
        { tarih: '12.02.2024', teshis: 'Sağ Ayak Bileği Grade 1 Burkulma', durum: 'Tamamen İyileşti' },
      ],
      acilMudahaleOnayi: true,
      sigortaSirketi: 'Allianz Sporcu Sağlık Sigortası',
      sigortaPoliceNo: 'POL-2024-891238',
    },
    performans: {
      teknikPuan: 8.8,
      fizikselPuan: 8.2,
      taktikselPuan: 8.6,
      zihinselPuan: 9.0,
      genelOrtalama: 8.65,
      antrenorGorus: 'Oyun kurucu pozisyonunda sahadaki liderliği, karar verme sürati ve saha vizyonu çok üst düzey. Şut stabilitesi üzerine çalışılmaya devam edilmeli.',
      gucluYonler: ['Saha Görüşü', 'Top Hakimiyeti', 'Baskı Altında Karar Verme', 'Takım İletişimi'],
      gelisimAlanlari: ['Zayıf El Turnike Bitirişleri', 'Perde Çıkışı Orta Mesafe Şut'],
      fizikselTestler: [
        { testAdi: '20m Sürat Koşusu', sonuc: '3.08 sn', hedef: '< 3.15 sn', durum: 'Iyi' },
        { testAdi: 'Dikey Sıçrama', sonuc: '54 cm', hedef: '> 50 cm', durum: 'Iyi' },
        { testAdi: 'Yo-Yo Aralıklı Toparlanma', sonuc: 'Seviye 17.4', hedef: 'Seviye 16.5', durum: 'Iyi' },
        { testAdi: 'Otur-Eriş Esneklik', sonuc: '+6 cm', hedef: '+8 cm', durum: 'Orta' },
      ],
      rozetler: [
        { baslik: 'Liderlik ve Oyun Zekası', kategori: 'Zihinsel & Taktik', tarih: 'Ekim 2024' },
        { baslik: 'Kusursuz Katılım', kategori: 'Disiplin', tarih: 'Kasım 2024' },
        { baslik: 'Fair Play Temsilcisi', kategori: 'Davranışsal', tarih: 'Aralık 2024' },
      ],
    },
    yoklama: {
      katilimYuzdesi: 94,
      toplamAntrenman: 48,
      katildigiAntrenman: 45,
      mazeretliDevamsizlik: 2,
      mazeretsizDevamsizlik: 1,
      sonKayitlar: [
        { tarih: '16.09.2024', saat: '18:00', baslik: 'Taktik ve Set Hücumu Antrenmanı', durum: 'Katildi' },
        { tarih: '14.09.2024', saat: '10:30', baslik: 'Kondisyon & Çabukluk Çalışması', durum: 'Katildi' },
        { tarih: '11.09.2024', saat: '18:00', baslik: '5v5 Hazırlık Maçı & Pozisyonel Analiz', durum: 'Katildi' },
        { tarih: '09.09.2024', saat: '18:00', baslik: 'Şut Gelişimi & Serbest Atış', durum: 'Katildi' },
        { tarih: '07.09.2024', saat: '11:00', baslik: 'Kuvvet ve Denge Antrenmanı', durum: 'Mazeretli', not: 'Okul sınav hazırlığı' },
      ],
    },
    finans: {
      paketAdi: 'Tam Zamanlı Lisanslı Sporcu Paketi',
      aylikAidat: 2750,
      odemePlani: 'Aylık Düzenli (Her Ayın 5\'i)',
      sonOdemeTarihi: '05.09.2024',
      sonrakiOdemeTarihi: '05.10.2024',
      bakiyeDurumu: 0,
      durum: 'Guncel',
      odemeler: [
        { id: 'od-1', donem: 'Eylül 2024', tutar: 2750, odemeTarihi: '05.09.2024', makbuzNo: 'MKZ-2024-0941', yontem: 'Kredi Kartı', durum: 'Odendi' },
        { id: 'od-2', donem: 'Ağustos 2024', tutar: 2750, odemeTarihi: '04.08.2024', makbuzNo: 'MKZ-2024-0821', yontem: 'Banka Havalesi', durum: 'Odendi' },
        { id: 'od-3', donem: 'Temmuz 2024', tutar: 2750, odemeTarihi: '05.07.2024', makbuzNo: 'MKZ-2024-0710', yontem: 'Kredi Kartı', durum: 'Odendi' },
      ],
    },
    notlarVeBelgeler: {
      notlar: [
        {
          id: 'n-1',
          yazar: 'Başantrenör Ali Özcan',
          unvan: 'Teknik Sorumlu',
          tarih: '12.09.2024',
          icerik: 'Hücum seti geçişlerinde takımı mükemmel yönetiyor. Önümüzdeki lig maçında ilk beş başlayacak.',
          kategori: 'Teknik Not',
        },
        {
          id: 'n-2',
          yazar: 'Dyt. Burcu Kaya',
          unvan: 'Kulüp Diyetisyeni',
          tarih: '28.08.2024',
          icerik: 'Maç öncesi karbonhidrat yüklemesi ve antrenman sonrası protein desteği planlandı, hidrasyon seviyesi iyi.',
          kategori: 'Beslenme',
        },
      ],
      belgeler: [
        { id: 'b-1', ad: 'Sporcu_Saglik_Raporu_2024.pdf', tur: 'PDF', yuklenmeTarihi: '15.09.2024', boyut: '1.4 MB', durum: 'Onaylandi' },
        { id: 'b-2', ad: 'TBF_Lisans_Karti_Onayli.pdf', tur: 'PDF', yuklenmeTarihi: '01.09.2024', boyut: '850 KB', durum: 'Onaylandi' },
        { id: 'b-3', ad: 'Veli_Muvafakatnamesi_Imzali.pdf', tur: 'PDF', yuklenmeTarihi: '04.09.2023', boyut: '2.1 MB', durum: 'Onaylandi' },
      ],
    },
  },

  's-3': {
    id: 's-3',
    sporcuKodu: '108392',
    kimlik: {
      tcKimlik: '19048172901',
      adSoyad: 'Kaan Yıldırım',
      dogumTarihi: '22.08.2010',
      dogumYeri: 'Ankara / Çankaya',
      yas: 14,
      cinsiyet: 'Erkek',
      kanGrubu: '0 Rh+',
      uyruk: 'T.C.',
      okul: 'Özel MEF Koleji',
      sinif: '8-A',
      ogrenciNo: '219',
      lisansNo: 'TR-ANK-2024-10839',
      lisansTuru: 'Kulüp Gelişim Lisansı',
      brans: 'Basketbol',
      mevki: 'Şutör Guard (Shooting Guard)',
      baskinTaraf: 'Sağ El',
      formaNo: 11,
      kulup: 'Saraçgym',
      takimGrup: 'U14 Basketbol Altyapı',
      kayitTarihi: '12.09.2023',
      durum: 'Aktif',
    },
    veli: {
      anneAdSoyad: 'Zeynep Yıldırım',
      anneTelefon: '+90 533 881 20 11',
      anneMeslek: 'Avukat',
      babaAdSoyad: 'Murat Yıldırım',
      babaTelefon: '+90 532 456 78 90',
      babaMeslek: 'İş İnsanı',
      birincilIletisim: 'Baba',
      veliEposta: 'murat.yildirim@gmail.com',
      evAdresi: 'Acıbadem Mah. Akasya Evleri A2 Blok No: 18',
      ilIlce: 'İstanbul / Üsküdar',
      acilDurumKisi: 'Murat Yıldırım',
      acilDurumTelefon: '+90 532 456 78 90',
      acilDurumYakinlik: 'Baba',
    },
    saglik: {
      boy: 172,
      kilo: 64,
      bki: 21.6,
      kanGrubu: '0 Rh+',
      saglikRaporuTarihi: '20.08.2024',
      saglikRaporuGecerlilik: '20.08.2025',
      raporDurumu: 'Gecerli',
      alerjiler: ['Bulunmuyor'],
      kronikRahatsizliklar: ['Bulunmuyor'],
      kullanilanIlaclar: ['Yok'],
      gecirilmisSakatliklar: [],
      acilMudahaleOnayi: true,
      sigortaSirketi: 'Axa Sigorta Sporcu Güvencesi',
      sigortaPoliceNo: 'AXA-9920194',
    },
    performans: {
      teknikPuan: 8.4,
      fizikselPuan: 7.9,
      taktikselPuan: 7.8,
      zihinselPuan: 8.5,
      genelOrtalama: 8.15,
      antrenorGorus: 'Yüksek şut yüzdesi ve hızlı hücumlarda doğru koşu açıları alması çok başarılı. Bireysel savunma ayak çabukluğu geliştirilmeli.',
      gucluYonler: ['Köşe Üçlükleri', 'Topsuz Katlar', 'Serbest Atış Yüzdesi'],
      gelisimAlanlari: ['Perde Savunması', 'Sol Elle Dripling'],
      fizikselTestler: [
        { testAdi: '20m Sürat Koşusu', sonuc: '3.19 sn', hedef: '< 3.20 sn', durum: 'Iyi' },
        { testAdi: 'Dikey Sıçrama', sonuc: '48 cm', hedef: '> 46 cm', durum: 'Iyi' },
        { testAdi: 'Mekik / Karın Kuvveti (1 dk)', sonuc: '44 adet', hedef: '> 40 adet', durum: 'Iyi' },
        { testAdi: 'Çeviklik T-Testi', sonuc: '10.8 sn', hedef: '< 10.5 sn', durum: 'Gelistirilmeli' },
      ],
      rozetler: [
        { baslik: 'Keskin Nişancı Şutör', kategori: 'Teknik', tarih: 'Kasım 2024' },
        { baslik: 'Takım Çalışması', kategori: 'Davranışsal', tarih: 'Eylül 2024' },
      ],
    },
    yoklama: {
      katilimYuzdesi: 96,
      toplamAntrenman: 46,
      katildigiAntrenman: 44,
      mazeretliDevamsizlik: 2,
      mazeretsizDevamsizlik: 0,
      sonKayitlar: [
        { tarih: '16.09.2024', saat: '17:30', baslik: 'Bireysel Şut ve Top Kontrolü', durum: 'Katildi' },
        { tarih: '13.09.2024', saat: '17:30', baslik: 'Takım Savunması ve Ribaund', durum: 'Katildi' },
        { tarih: '10.09.2024', saat: '17:30', baslik: 'Kondisyon & Hızlı Hücum', durum: 'Katildi' },
      ],
    },
    finans: {
      paketAdi: 'Gelişim Grubu Standart Paketi',
      aylikAidat: 2400,
      odemePlani: 'Aylık Düzenli (Her Ayın 10\'u)',
      sonOdemeTarihi: '10.09.2024',
      sonrakiOdemeTarihi: '10.10.2024',
      bakiyeDurumu: 0,
      durum: 'Guncel',
      odemeler: [
        { id: 'od-301', donem: 'Eylül 2024', tutar: 2400, odemeTarihi: '10.09.2024', makbuzNo: 'MKZ-2024-0998', yontem: 'Kredi Kartı', durum: 'Odendi' },
        { id: 'od-302', donem: 'Ağustos 2024', tutar: 2400, odemeTarihi: '10.08.2024', makbuzNo: 'MKZ-2024-0881', yontem: 'Kredi Kartı', durum: 'Odendi' },
      ],
    },
    notlarVeBelgeler: {
      notlar: [
        {
          id: 'n-301',
          yazar: 'Antrenör Selman Utku',
          unvan: 'Bireysel Gelişim Antrenörü',
          tarih: '14.09.2024',
          icerik: 'Haftada bir gün ek şut mekaniği çalışması verimli geçiyor, yayın gerisinden isabet oranı %48\'e yükseldi.',
          kategori: 'Gelişim Notu',
        },
      ],
      belgeler: [
        { id: 'b-301', ad: 'Saglik_Raporu_Kaan_Yildirim.pdf', tur: 'PDF', yuklenmeTarihi: '20.08.2024', boyut: '1.1 MB', durum: 'Onaylandi' },
        { id: 'b-302', ad: 'Veli_Izin_Belgesi.pdf', tur: 'PDF', yuklenmeTarihi: '12.09.2023', boyut: '640 KB', durum: 'Onaylandi' },
      ],
    },
  },

  's-4': {
    id: 's-4',
    sporcuKodu: '782910',
    kimlik: {
      tcKimlik: '30291847102',
      adSoyad: 'Melis Aksoy',
      dogumTarihi: '10.11.2009',
      dogumYeri: 'İzmir / Karşıyaka',
      yas: 15,
      cinsiyet: 'Kız',
      kanGrubu: 'B Rh+',
      uyruk: 'T.C.',
      okul: 'Saint-Joseph Fransız Lisesi',
      sinif: '9-C',
      ogrenciNo: '302',
      lisansNo: 'TR-IST-2024-78291',
      lisansTuru: 'Kulüp Yıldız Kızlar Lisansı',
      brans: 'Voleybol',
      mevki: 'Smaçör (Outside Hitter)',
      baskinTaraf: 'Sağ El',
      formaNo: 9,
      kulup: 'aicosports',
      takimGrup: 'Yıldız Kızlar Takımı',
      kayitTarihi: '15.09.2023',
      durum: 'Aktif',
    },
    veli: {
      anneAdSoyad: 'Selin Aksoy',
      anneTelefon: '+90 535 220 99 11',
      anneMeslek: 'Öğretim Görevlisi',
      babaAdSoyad: 'Bora Aksoy',
      babaTelefon: '+90 532 991 33 44',
      babaMeslek: 'Finans Müdürü',
      birincilIletisim: 'Anne',
      veliEposta: 'melisaksoy@gmail.com',
      evAdresi: 'Fenerbahçe Mah. Lale Sok. No: 12',
      ilIlce: 'İstanbul / Kadıköy',
      acilDurumKisi: 'Selin Aksoy',
      acilDurumTelefon: '+90 535 220 99 11',
      acilDurumYakinlik: 'Anne',
    },
    saglik: {
      boy: 176,
      kilo: 61,
      bki: 19.7,
      kanGrubu: 'B Rh+',
      saglikRaporuTarihi: '10.09.2024',
      saglikRaporuGecerlilik: '10.09.2025',
      raporDurumu: 'Gecerli',
      alerjiler: ['Bulunmuyor'],
      kronikRahatsizliklar: ['Bulunmuyor'],
      kullanilanIlaclar: ['Yok'],
      gecirilmisSakatliklar: [],
      acilMudahaleOnayi: true,
      sigortaSirketi: 'Anadolu Sigorta Sporcu Poliçesi',
      sigortaPoliceNo: 'AND-440192',
    },
    performans: {
      teknikPuan: 9.1,
      fizikselPuan: 8.7,
      taktikselPuan: 8.5,
      zihinselPuan: 8.9,
      genelOrtalama: 8.8,
      antrenorGorus: 'Sıçrama kabiliyeti, hücumdaki smaç vuruş sertliği ve servis karşılama stabilitesi olağanüstü seviyede.',
      gucluYonler: ['Hücum Smaçları', 'Sıçrama Yüksekliği', 'Servis Karşılama', 'Hırs'],
      gelisimAlanlari: ['Dublaj ve Arka Alan Savunması'],
      fizikselTestler: [
        { testAdi: 'Smaç Sıçraması', sonuc: '272 cm', hedef: '> 265 cm', durum: 'Iyi' },
        { testAdi: 'Blok Sıçraması', sonuc: '258 cm', hedef: '> 250 cm', durum: 'Iyi' },
        { testAdi: 'Pro-Agility Çeviklik', sonuc: '4.85 sn', hedef: '< 4.90 sn', durum: 'Iyi' },
      ],
      rozetler: [
        { baslik: 'Smaç Ustası', kategori: 'Teknik', tarih: 'Ekim 2024' },
        { baslik: 'Lider Oyuncu', kategori: 'Karakter', tarih: 'Eylül 2024' },
      ],
    },
    yoklama: {
      katilimYuzdesi: 98,
      toplamAntrenman: 42,
      katildigiAntrenman: 41,
      mazeretliDevamsizlik: 1,
      mazeretsizDevamsizlik: 0,
      sonKayitlar: [
        { tarih: '16.09.2024', saat: '16:00', baslik: 'Hücum Kombinasyonları ve Dublaj', durum: 'Katildi' },
        { tarih: '14.09.2024', saat: '09:30', baslik: 'Servis & Servis Karşılama Çalışması', durum: 'Katildi' },
      ],
    },
    finans: {
      paketAdi: 'Elit Sporcu Paketi',
      aylikAidat: 2900,
      odemePlani: 'Aylık Düzenli (Her Ayın 1\'i)',
      sonOdemeTarihi: '01.09.2024',
      sonrakiOdemeTarihi: '01.10.2024',
      bakiyeDurumu: 0,
      durum: 'Guncel',
      odemeler: [
        { id: 'od-401', donem: 'Eylül 2024', tutar: 2900, odemeTarihi: '01.09.2024', makbuzNo: 'MKZ-2024-0912', yontem: 'Kredi Kartı', durum: 'Odendi' },
      ],
    },
    notlarVeBelgeler: {
      notlar: [
        {
          id: 'n-401',
          yazar: 'Antrenör Elif Aydın',
          unvan: 'Voleybol Başantrenörü',
          tarih: '15.09.2024',
          icerik: 'Milli takım gelişim kampı aday kadro izleme listesine tavsiye edildi.',
          kategori: 'Kariyer & Scout',
        },
      ],
      belgeler: [
        { id: 'b-401', ad: 'Saglik_Belgesi_Melis_Aksoy.pdf', tur: 'PDF', yuklenmeTarihi: '10.09.2024', boyut: '1.3 MB', durum: 'Onaylandi' },
        { id: 'b-402', ad: 'TVF_Lisans_Belgesi_2024.pdf', tur: 'PDF', yuklenmeTarihi: '05.09.2024', boyut: '720 KB', durum: 'Onaylandi' },
      ],
    },
  },

  's-2': {
    id: 's-2',
    sporcuKodu: '571112',
    kimlik: {
      tcKimlik: '41920194820',
      adSoyad: 'Dhhbn',
      dogumTarihi: '03.04.2009',
      dogumYeri: 'İstanbul / Üsküdar',
      yas: 15,
      cinsiyet: 'Erkek',
      kanGrubu: 'ARh-',
      uyruk: 'T.C.',
      okul: 'Marmara Koleji',
      sinif: '9-A',
      ogrenciNo: '184',
      lisansNo: 'TR-IST-2024-57111',
      lisansTuru: 'Kulüp Altyapı Lisansı',
      brans: 'Futbol',
      mevki: 'Stoper (Defans)',
      baskinTaraf: 'Sol Ayak',
      formaNo: 4,
      kulup: 'Selman Utku',
      takimGrup: 'U15 Futbol Gelişim',
      kayitTarihi: '06.09.2023',
      durum: 'Aktif',
    },
    veli: {
      anneAdSoyad: 'Fatma Demir',
      anneTelefon: '+90 533 111 44 22',
      anneMeslek: 'Öğretmen',
      babaAdSoyad: 'Hakan Demir',
      babaTelefon: '+90 532 777 88 99',
      babaMeslek: 'Banka Müdürü',
      birincilIletisim: 'Baba',
      veliEposta: 'selmanutkumarmara@gmail.com',
      evAdresi: 'Koşuyolu Mah. Cenap Şahabettin Sok. No: 8',
      ilIlce: 'İstanbul / Kadıköy',
      acilDurumKisi: 'Hakan Demir',
      acilDurumTelefon: '+90 532 777 88 99',
      acilDurumYakinlik: 'Baba',
    },
    saglik: {
      boy: 175,
      kilo: 67,
      bki: 21.9,
      kanGrubu: 'ARh-',
      saglikRaporuTarihi: '01.09.2024',
      saglikRaporuGecerlilik: '01.09.2025',
      raporDurumu: 'Gecerli',
      alerjiler: ['Bulunmuyor'],
      kronikRahatsizliklar: ['Bulunmuyor'],
      kullanilanIlaclar: ['Yok'],
      gecirilmisSakatliklar: [],
      acilMudahaleOnayi: true,
      sigortaSirketi: 'Sompo Sigorta',
      sigortaPoliceNo: 'SMP-819204',
    },
    performans: {
      teknikPuan: 7.9,
      fizikselPuan: 8.4,
      taktikselPuan: 8.1,
      zihinselPuan: 8.0,
      genelOrtalama: 8.1,
      antrenorGorus: 'Hava toplarında ve birebir müdafaada sert ve dengeli müdahaleleri var. Pasla oyuna çıkışlarda soğukkanlılığı artırılmalı.',
      gucluYonler: ['Hava Topları', 'Tackle / Top Kapma', 'Pozisyon Sadakati'],
      gelisimAlanlari: ['Uzun Diyagonal Paslar', 'Ters Kademeye Giriş'],
      fizikselTestler: [
        { testAdi: '30m Depar', sonuc: '4.18 sn', hedef: '< 4.25 sn', durum: 'Iyi' },
        { testAdi: 'Dikey Sıçrama', sonuc: '51 cm', hedef: '> 48 cm', durum: 'Iyi' },
      ],
      rozetler: [
        { baslik: 'Savunma Duvarı', kategori: 'Teknik', tarih: 'Ekim 2024' },
      ],
    },
    yoklama: {
      katilimYuzdesi: 91,
      toplamAntrenman: 44,
      katildigiAntrenman: 40,
      mazeretliDevamsizlik: 3,
      mazeretsizDevamsizlik: 1,
      sonKayitlar: [
        { tarih: '16.09.2024', saat: '18:30', baslik: 'Duran Top ve Alan Savunması', durum: 'Katildi' },
      ],
    },
    finans: {
      paketAdi: 'Gelişim Paketi',
      aylikAidat: 2300,
      odemePlani: 'Aylık Düzenli',
      sonOdemeTarihi: '06.09.2024',
      sonrakiOdemeTarihi: '06.10.2024',
      bakiyeDurumu: 0,
      durum: 'Guncel',
      odemeler: [
        { id: 'od-201', donem: 'Eylül 2024', tutar: 2300, odemeTarihi: '06.09.2024', makbuzNo: 'MKZ-2024-0922', yontem: 'Havale', durum: 'Odendi' },
      ],
    },
    notlarVeBelgeler: {
      notlar: [
        {
          id: 'n-201',
          yazar: 'Antrenör Hakan Kaya',
          unvan: 'Futbol Antrenörü',
          tarih: '10.09.2024',
          icerik: 'Kademeye giriş zamanlaması gelişti. Fiziksel gücünü ikili mücadelelerde doğru kullanıyor.',
          kategori: 'Taktik Not',
        },
      ],
      belgeler: [
        { id: 'b-201', ad: 'Saglik_Belgesi.pdf', tur: 'PDF', yuklenmeTarihi: '01.09.2024', boyut: '980 KB', durum: 'Onaylandi' },
      ],
    },
  },
};

const STORAGE_KEY = 'sportsfly_sporcu_profilleri';

function ensureValidProfil(p: any): SporcuProfil {
  if (!p) return p;
  return {
    ...p,
    galeri: Array.isArray(p?.galeri) ? p.galeri : [],
    saglik: {
      ...p?.saglik,
      alerjiler: Array.isArray(p?.saglik?.alerjiler) ? p.saglik.alerjiler : [],
      kronikRahatsizliklar: Array.isArray(p?.saglik?.kronikRahatsizliklar) ? p.saglik.kronikRahatsizliklar : [],
      kullanilanIlaclar: Array.isArray(p?.saglik?.kullanilanIlaclar) ? p.saglik.kullanilanIlaclar : [],
      gecirilmisSakatliklar: Array.isArray(p?.saglik?.gecirilmisSakatliklar) ? p.saglik.gecirilmisSakatliklar : [],
    },
    performans: {
      ...p?.performans,
      gucluYonler: Array.isArray(p?.performans?.gucluYonler) ? p.performans.gucluYonler : [],
      gelisimAlanlari: Array.isArray(p?.performans?.gelisimAlanlari) ? p.performans.gelisimAlanlari : [],
      fizikselTestler: Array.isArray(p?.performans?.fizikselTestler) ? p.performans.fizikselTestler : [],
      rozetler: Array.isArray(p?.performans?.rozetler) ? p.performans.rozetler : [],
    },
    yoklama: {
      ...p?.yoklama,
      sonKayitlar: Array.isArray(p?.yoklama?.sonKayitlar) ? p.yoklama.sonKayitlar : [],
    },
    finans: {
      ...p?.finans,
      odemeler: Array.isArray(p?.finans?.odemeler) ? p.finans.odemeler : [],
    },
    notlarVeBelgeler: {
      ...p?.notlarVeBelgeler,
      notlar: Array.isArray(p?.notlarVeBelgeler?.notlar) ? p.notlarVeBelgeler.notlar : [],
      belgeler: Array.isArray(p?.notlarVeBelgeler?.belgeler) ? p.notlarVeBelgeler.belgeler : [],
    },
  };
}

export function getStoredSporcuProfilleri(): Record<string, SporcuProfil> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: Record<string, SporcuProfil> = { ...INITIAL_SPORCU_PROFILLERI };
      Object.keys(parsed).forEach((k) => {
        merged[k] = ensureValidProfil({
          ...(INITIAL_SPORCU_PROFILLERI[k] || {}),
          ...parsed[k],
        });
      });
      return merged;
    }
  } catch (err) {
    console.error('Sporcu profilleri yüklenirken hata:', err);
  }
  return INITIAL_SPORCU_PROFILLERI;
}

export function saveStoredSporcuProfilleri(profiller: Record<string, SporcuProfil>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiller));
  } catch (err) {
    console.error('Sporcu profilleri kaydedilirken hata:', err);
  }
}

export function getOrCreateSporcuProfil(sporcu: { id: string; name: string; email: string; code: string; date?: string; facility?: string }): SporcuProfil {
  const all = getStoredSporcuProfilleri();
  if (all[sporcu.id]) {
    return ensureValidProfil(all[sporcu.id]);
  }

  // Generate a clean default profile
  const newProfil: SporcuProfil = {
    id: sporcu.id,
    sporcuKodu: sporcu.code,
    kimlik: {
      tcKimlik: '10000000000',
      adSoyad: sporcu.name,
      dogumTarihi: '01.01.2009',
      dogumYeri: 'İstanbul',
      yas: 15,
      cinsiyet: 'Erkek',
      kanGrubu: 'A Rh+',
      uyruk: 'T.C.',
      okul: 'Kayıtlı Okul',
      sinif: '9. Sınıf',
      ogrenciNo: sporcu.code.slice(0, 3),
      lisansNo: `TR-${sporcu.code}`,
      lisansTuru: 'Kulüp Sporcu Lisansı',
      brans: 'Basketbol / Futbol',
      mevki: 'Genel Sporcu',
      baskinTaraf: 'Sağ',
      formaNo: 10,
      kulup: sporcu.facility || 'SportsFly Kulübü',
      takimGrup: 'Gelişim Takımı',
      kayitTarihi: sporcu.date || '01.09.2023',
      durum: 'Aktif',
      fotoUrl: (sporcu as any).avatarUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
    },
    galeri: [
      {
        id: `sg-${Date.now()}-1`,
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
        title: 'Sezon Açılış Antrenmanı',
        date: sporcu.date || '14.09.2024',
        category: 'Antrenman',
      },
    ],
    veli: {
      anneAdSoyad: 'Kayıtlı Anne',
      anneTelefon: '+90 532 000 00 01',
      anneMeslek: 'Belirtilmedi',
      babaAdSoyad: 'Kayıtlı Baba',
      babaTelefon: '+90 532 000 00 02',
      babaMeslek: 'Belirtilmedi',
      birincilIletisim: 'Baba',
      veliEposta: sporcu.email,
      evAdresi: 'Kayıtlı İkametgah Adresi',
      ilIlce: 'İstanbul',
      acilDurumKisi: 'Kayıtlı Veli',
      acilDurumTelefon: '+90 532 000 00 02',
      acilDurumYakinlik: 'Veli',
    },
    saglik: {
      boy: 172,
      kilo: 63,
      bki: 21.3,
      kanGrubu: 'A Rh+',
      saglikRaporuTarihi: '01.09.2024',
      saglikRaporuGecerlilik: '01.09.2025',
      raporDurumu: 'Gecerli',
      alerjiler: ['Belirtilmedi'],
      kronikRahatsizliklar: ['Yok'],
      kullanilanIlaclar: ['Yok'],
      gecirilmisSakatliklar: [],
      acilMudahaleOnayi: true,
      sigortaSirketi: 'Sporcu Sağlık Sigortası',
      sigortaPoliceNo: `POL-${sporcu.code}`,
    },
    performans: {
      teknikPuan: 8.0,
      fizikselPuan: 7.8,
      taktikselPuan: 7.9,
      zihinselPuan: 8.2,
      genelOrtalama: 7.97,
      antrenorGorus: 'Gelişime açık, antrenman disiplini yüksek sporcu.',
      gucluYonler: ['Disiplin', 'Takım Çalışması'],
      gelisimAlanlari: ['Kondisyon'],
      fizikselTestler: [
        { testAdi: '20m Sürat', sonuc: '3.20 sn', hedef: '< 3.25 sn', durum: 'Iyi' },
        { testAdi: 'Dikey Sıçrama', sonuc: '48 cm', hedef: '> 45 cm', durum: 'Iyi' },
      ],
      rozetler: [
        { baslik: 'Düzenli Katılım', kategori: 'Disiplin', tarih: 'Eylül 2024' },
      ],
    },
    yoklama: {
      katilimYuzdesi: 92,
      toplamAntrenman: 30,
      katildigiAntrenman: 28,
      mazeretliDevamsizlik: 2,
      mazeretsizDevamsizlik: 0,
      sonKayitlar: [
        { tarih: '16.09.2024', saat: '18:00', baslik: 'Genel Antrenman', durum: 'Katildi' },
      ],
    },
    finans: {
      paketAdi: 'Standart Sporcu Paketi',
      aylikAidat: 2250,
      odemePlani: 'Aylık Düzenli',
      sonOdemeTarihi: '05.09.2024',
      sonrakiOdemeTarihi: '05.10.2024',
      bakiyeDurumu: 0,
      durum: 'Guncel',
      odemeler: [
        { id: `od-${Date.now()}`, donem: 'Eylül 2024', tutar: 2250, odemeTarihi: '05.09.2024', makbuzNo: `MKZ-${sporcu.code}`, yontem: 'Kredi Kartı', durum: 'Odendi' },
      ],
    },
    notlarVeBelgeler: {
      notlar: [
        {
          id: `n-${Date.now()}`,
          yazar: 'Kulüp Antrenörü',
          unvan: 'Antrenör',
          tarih: '10.09.2024',
          icerik: 'Sporcu kulüp antrenmanlarına intibak sürecini başarıyla tamamladı.',
          kategori: 'Genel Not',
        },
      ],
      belgeler: [
        { id: `b-${Date.now()}`, ad: 'Sporcu_Kayit_Formu.pdf', tur: 'PDF', yuklenmeTarihi: sporcu.date || '01.09.2023', boyut: '850 KB', durum: 'Onaylandi' },
      ],
    },
  };

  all[sporcu.id] = newProfil;
  saveStoredSporcuProfilleri(all);
  return newProfil;
}
