export interface SporcuKarne {
  id: string;
  sporcuId: string;
  adSoyad: string;
  brans: string;
  grup: string;
  yasGubu: string;
  tarih: string; // Report date
  antrenor: string;
  boy: number; // cm
  kilo: number; // kg
  
  // Evaluation categories (out of 10)
  teknik: {
    topKontrolu?: number;
    pasBasarisi?: number;
    sut?: number;
    topSurme?: number;
    savunma?: number;
    ortalama: number;
  };
  fiziksel: {
    hiz?: number;
    dayaniklilik?: number;
    guc?: number;
    ceviklik?: number;
    ortalama: number;
  };
  taktiksel: {
    oyunZekasi?: number;
    pozisyonAlma?: number;
    kararVerme?: number;
    ortalama: number;
  };
  zihinsel: {
    disiplin?: number;
    ozguven?: number;
    takimUyumu?: number;
    liderlik?: number;
    ortalama: number;
  };

  // Additional Stats
  katilimYuzdesi: number;
  antrenmanSayisi: number;
  
  // Behavioral Development Process
  davranissal: {
    kriterler: {
      fairPlay: number;
      sorumlulukEkipman: number;
      saygiIletisim: number;
      yonergeyeUyum: number;
      duyguKontrolu: number;
      ortalama: number;
    };
    kazanimlar: {
      id?: string;
      rozetId?: string;
      baslik: string;
      aciklama: string;
      kategori?: string;
      tarih?: string;
      onemDerecesi?: string;
    }[];
    surecTakibi: {
      donem: string;
      tarih: string;
      durum: 'Gelişiyor' | 'Hedefe Ulaştı' | 'Örnek Davranış';
      odakKonusu: string;
      gozlem: string;
    }[];
    bagimlilikVeAliskanlik?: {
      ekranDengesi: {
        puan: number;
        seviye: 'Dengeli & Bilinçli' | 'Geliştirilmeli' | 'Riskli';
        aciklama: string;
      };
      zararliAliskanlik: {
        puan: number;
        seviye: 'Bilinçli (Örnek)' | 'Takip Ediliyor' | 'Riskli' | 'Temiz Spor (Örnek)';
        aciklama: string;
      };
      uykuVeDinlenme: {
        puan: number;
        seviye: 'Düzenli (8+ Saat)' | 'Düzensiz' | 'Yetersiz';
        aciklama: string;
      };
      genelFarkindalik: 'Örnek & Bilinçli' | 'Dengeli' | 'Destek Gerekli';
      egitmenGorus: string;
    };
    genelDegerlendirme: string;
  };

  // Notes
  antrenorNotu: string;
  gelisimAlanlari: string[];

  // Veli ve İletişim Bilgileri (WhatsApp / SMS Gönderimi için)
  veliAdSoyad?: string;
  veliTelefon?: string;
  veliEposta?: string;
  veliYakinlik?: 'Anne' | 'Baba' | 'Vasi' | 'Diğer';
}

export const INITIAL_KARNELER: SporcuKarne[] = [
  {
    id: 'k1',
    sporcuId: 's-3',
    adSoyad: 'Kaan Yıldırım',
    brans: 'Basketbol',
    grup: 'Genç Takım (U16)',
    yasGubu: 'U16',
    tarih: '2024-02-15',
    antrenor: 'Selman Utku',
    boy: 172,
    kilo: 64,
    veliAdSoyad: 'Murat Yıldırım',
    veliTelefon: '+90 535 600 77 33',
    veliEposta: 'kaanyildirim@spor.org',
    veliYakinlik: 'Baba',
    teknik: {
      topKontrolu: 8,
      pasBasarisi: 7,
      sut: 9,
      topSurme: 8,
      savunma: 6,
      ortalama: 7.6
    },
    fiziksel: {
      hiz: 7,
      dayaniklilik: 8,
      guc: 6,
      ceviklik: 8,
      ortalama: 7.25
    },
    taktiksel: {
      oyunZekasi: 8,
      pozisyonAlma: 7,
      kararVerme: 8,
      ortalama: 7.66
    },
    zihinsel: {
      disiplin: 9,
      ozguven: 8,
      takimUyumu: 9,
      liderlik: 7,
      ortalama: 8.25
    },
    katilimYuzdesi: 95,
    antrenmanSayisi: 24,
    davranissal: {
      kriterler: {
        fairPlay: 9,
        sorumlulukEkipman: 8,
        saygiIletisim: 9,
        yonergeyeUyum: 8,
        duyguKontrolu: 8,
        ortalama: 8.4
      },
      kazanimlar: [
        {
          baslik: 'Fair-Play & Centilmenlik',
          aciklama: 'Rakip ve hakem kararlarına her daim saygılı ve sportmen yaklaşım.'
        },
        {
          baslik: 'Takım Ruhu & Yardımlaşma',
          aciklama: 'Hata yapan arkadaşlarına moral vererek saha içi birlikteliği pekiştiriyor.'
        },
        {
          baslik: 'Ekipman & Düzen Bilinci',
          aciklama: 'Antrenman öncesi ve sonrası malzeme düzeninde aktif sorumluluk alıyor.'
        }
      ],
      surecTakibi: [
        {
          donem: '1. Dönem (Güz)',
          tarih: '2023-11-30',
          durum: 'Gelişiyor',
          odakKonusu: 'Dinleme ve Odaklanma',
          gozlem: 'Antrenman molalarında zaman zaman dikkat dağınıklığı gözlemlendi; koç yönlendirmeleriyle hızlı toparlandı.'
        },
        {
          donem: '2. Dönem (Kış)',
          tarih: '2024-01-15',
          durum: 'Hedefe Ulaştı',
          odakKonusu: 'Duygu Kontrolü & Maç Stresi',
          gozlem: 'Maç içi gergin anlarda sakin kalıp enerjisini taktiksel disipline aktarmayı başardı.'
        },
        {
          donem: '3. Dönem (Bahar)',
          tarih: '2024-02-15',
          durum: 'Örnek Davranış',
          odakKonusu: 'Saha İçi Liderlik ve Rol Modellik',
          gozlem: 'Centilmenliği, çalışma azmi ve takım arkadaşlarına yapıcı geri bildirimleriyle örnek sporcu seviyesine ulaştı.'
        }
      ],
      bagimlilikVeAliskanlik: {
        ekranDengesi: {
          puan: 8.5,
          seviye: 'Dengeli & Bilinçli',
          aciklama: 'Antrenman ve maç günlerinde telefon süresini başarıyla kısıtlıyor, oyun süreleri kontrollü.'
        },
        zararliAliskanlik: {
          puan: 10,
          seviye: 'Bilinçli (Örnek)',
          aciklama: 'Tütün, elektronik sigara ve enerji içeceklerine karşı tam bilinç; sağlıklı sporcu disiplini taşıyor.'
        },
        uykuVeDinlenme: {
          puan: 9.0,
          seviye: 'Düzenli (8+ Saat)',
          aciklama: 'Gece ekran kısıtlaması ile uyku ritmini koruyor, sabah antrenmanlarına dinç katılıyor.'
        },
        genelFarkindalik: 'Örnek & Bilinçli',
        egitmenGorus: 'Kaan, saha dışı yaşam alışkanlıklarında ve dijital denge konusunda altyapıdaki arkadaşlarına örnek bir disiplin sergilemektedir.'
      },
      genelDegerlendirme: 'Kaan, antrenman ciddiyeti, hakem kararlarına olgun yaklaşımı ve arkadaşlarına aşıladığı pozitif enerjiyle örnek bir sporcu karakteri sergilemektedir.'
    },
    antrenorNotu: 'Kaan bu dönem özellikle şut yüzdesinde büyük gelişim gösterdi. Fiziksel güçlenme çalışmalarına ağırlık vermesi gerekiyor. Takım içindeki uyumu ve antrenman disiplini takdire şayan.',
    gelisimAlanlari: ['Fiziksel Güç', 'Birebir Savunma']
  },
  {
    id: 'k2',
    sporcuId: 's-1',
    adSoyad: 'Selman Utku',
    brans: 'Basketbol',
    grup: 'U14 Erkek Gelişim A',
    yasGubu: 'U14',
    tarih: '2024-02-10',
    antrenor: 'Ali Özcan',
    boy: 168,
    kilo: 58,
    veliAdSoyad: 'Marmara Utku',
    veliTelefon: '+90 538 597 92 22',
    veliEposta: 'selmanutkumarmara@gmail.com',
    veliYakinlik: 'Baba',
    teknik: {
      topKontrolu: 9,
      pasBasarisi: 9,
      sut: 8,
      topSurme: 9,
      savunma: 8,
      ortalama: 8.6
    },
    fiziksel: {
      hiz: 9,
      dayaniklilik: 8,
      guc: 7,
      ceviklik: 9,
      ortalama: 8.25
    },
    taktiksel: {
      oyunZekasi: 9,
      pozisyonAlma: 9,
      kararVerme: 9,
      ortalama: 9.0
    },
    zihinsel: {
      disiplin: 9,
      ozguven: 9,
      takimUyumu: 9,
      liderlik: 9,
      ortalama: 9.0
    },
    katilimYuzdesi: 96,
    antrenmanSayisi: 28,
    davranissal: {
      kriterler: {
        fairPlay: 9,
        sorumlulukEkipman: 9,
        saygiIletisim: 9,
        yonergeyeUyum: 9,
        duyguKontrolu: 9,
        ortalama: 9.0
      },
      kazanimlar: [
        {
          baslik: 'Takım Kaptanlığı & Rol Model',
          aciklama: 'Saha içi ve saha dışında takım arkadaşlarına liderlik ve örnek duruş sergiliyor.'
        },
        {
          baslik: 'Yüksek Antrenman Disiplini',
          aciklama: 'Tüm idmanlara eksiksiz katılım ve tam odaklanma.'
        }
      ],
      surecTakibi: [
        {
          donem: '1. Dönem',
          tarih: '2023-10-31',
          durum: 'Hedefe Ulaştı',
          odakKonusu: 'Saha İçi Liderlik',
          gozlem: 'Takımın hücum organizasyonunu ve savunma sertliğini koordine etti.'
        },
        {
          donem: '2. Dönem',
          tarih: '2024-02-10',
          durum: 'Örnek Davranış',
          odakKonusu: 'Centilmenlik ve İletişim',
          gozlem: 'Hakem ve koç kararlarına saygılı örnek sporcu profili.'
        }
      ],
      bagimlilikVeAliskanlik: {
        ekranDengesi: {
          puan: 9.0,
          seviye: 'Dengeli & Bilinçli',
          aciklama: 'Dijital ekran süresinde bilinçli ve düzenli sporcu disiplini.'
        },
        zararliAliskanlik: {
          puan: 10,
          seviye: 'Bilinçli (Örnek)',
          aciklama: 'Beslenme ve sağlıklı hidrasyon alışkanlıklarında örnek sporcu.'
        },
        uykuVeDinlenme: {
          puan: 9.0,
          seviye: 'Düzenli (8+ Saat)',
          aciklama: 'Erken uyku ve kaliteli toparlanma süreci.'
        },
        genelFarkindalik: 'Örnek & Bilinçli',
        egitmenGorus: 'Selman her yönden akademi altyapımızın örnek sporcusudur.'
      },
      genelDegerlendirme: 'Selman, saha içi teknik becerisi ve üstün karakter özellikleriyle örnek bir liderdir.'
    },
    antrenorNotu: 'Selman sahadaki oyun kurucu vizyonu ve arkadaşlarına verdiği güvenle takımın temel direği konumundadır.',
    gelisimAlanlari: ['Orta Mesafe Şut İstikrarı']
  },
  {
    id: 'k3',
    sporcuId: 's-2',
    adSoyad: 'Zeynep Kaya',
    brans: 'Voleybol',
    grup: 'Midi Kız Takımı A',
    yasGubu: 'U13',
    tarih: '2024-02-12',
    antrenor: 'Pınar Çakmakçı',
    boy: 165,
    kilo: 52,
    veliAdSoyad: 'Ayşe Kaya',
    veliTelefon: '+90 533 450 12 88',
    veliEposta: 'zeynep.kaya@gmail.com',
    veliYakinlik: 'Anne',
    teknik: {
      topKontrolu: 9,
      pasBasarisi: 9,
      sut: 8,
      topSurme: 8,
      savunma: 9,
      ortalama: 8.6
    },
    fiziksel: {
      hiz: 8,
      dayaniklilik: 8,
      guc: 7,
      ceviklik: 9,
      ortalama: 8.0
    },
    taktiksel: {
      oyunZekasi: 9,
      pozisyonAlma: 9,
      kararVerme: 8,
      ortalama: 8.66
    },
    zihinsel: {
      disiplin: 9,
      ozguven: 8,
      takimUyumu: 10,
      liderlik: 8,
      ortalama: 8.75
    },
    katilimYuzdesi: 92,
    antrenmanSayisi: 26,
    davranissal: {
      kriterler: {
        fairPlay: 9,
        sorumlulukEkipman: 9,
        saygiIletisim: 9,
        yonergeyeUyum: 9,
        duyguKontrolu: 9,
        ortalama: 9.0
      },
      kazanimlar: [
        {
          baslik: 'Takım Ruhu & Pasör Vizyonu',
          aciklama: 'Hücum setlerinde arkadaşlarına en uygun topları aktarıp moral veriyor.'
        },
        {
          baslik: 'Savunma Fedakarlığı',
          aciklama: 'Manşet ve plonjonda yüksek gayret ve cesaret.'
        }
      ],
      surecTakibi: [
        {
          donem: '1. Dönem',
          tarih: '2023-11-20',
          durum: 'Hedefe Ulaştı',
          odakKonusu: 'Servis ve Manşet İstikrarı',
          gozlem: 'Temel tekniklerde hızlı ivme yakaladı.'
        },
        {
          donem: '2. Dönem',
          tarih: '2024-02-12',
          durum: 'Örnek Davranış',
          odakKonusu: 'Saha İçi Yardımlaşma',
          gozlem: 'Takım arkadaşlarını her sayıda motive ediyor.'
        }
      ],
      bagimlilikVeAliskanlik: {
        ekranDengesi: {
          puan: 8.5,
          seviye: 'Dengeli & Bilinçli',
          aciklama: 'Sosyal medya süresinde sağlıklı ve dengeli yaklaşım.'
        },
        zararliAliskanlik: {
          puan: 10,
          seviye: 'Bilinçli (Örnek)',
          aciklama: 'Sağlıklı beslenme ve sporcu alışkanlıklarına sadık.'
        },
        uykuVeDinlenme: {
          puan: 9.0,
          seviye: 'Düzenli (8+ Saat)',
          aciklama: 'Düzenli dinlenme ve okul-spor dengesi.'
        },
        genelFarkindalik: 'Örnek & Bilinçli',
        egitmenGorus: 'Zeynep hem okulunda hem de voleybol branşında parmakla gösterilen bir sporcudur.'
      },
      genelDegerlendirme: 'Zeynep yüksek tekniği, pas kalitesi ve takım arkadaşlarıyla kurduğu pozitif bağla geleceği parlak bir sporcudur.'
    },
    antrenorNotu: 'Zeynep pasörlük pozisyonunda kritik pas dağılımlarıyla takımı çok iyi yönetiyor. Sıçrama kuvvetine devam edeceğiz.',
    gelisimAlanlari: ['Blok Zamanlaması']
  },
  {
    id: 'k4',
    sporcuId: 's-4',
    adSoyad: 'Melis Aksoy',
    brans: 'Jimnastik',
    grup: 'Temel Jimnastik',
    yasGubu: 'U10',
    tarih: '2024-02-05',
    antrenor: 'Selin Aydın',
    boy: 135,
    kilo: 30,
    veliAdSoyad: 'Emel Aksoy',
    veliTelefon: '+90 538 900 88 44',
    veliEposta: 'melisaksoy@gmail.com',
    veliYakinlik: 'Anne',
    teknik: {
      topKontrolu: 8,
      pasBasarisi: 8,
      sut: 7,
      topSurme: 8,
      savunma: 8,
      ortalama: 7.8
    },
    fiziksel: {
      hiz: 9,
      dayaniklilik: 8,
      guc: 8,
      ceviklik: 10,
      ortalama: 8.75
    },
    taktiksel: {
      oyunZekasi: 8,
      pozisyonAlma: 8,
      kararVerme: 8,
      ortalama: 8.0
    },
    zihinsel: {
      disiplin: 9,
      ozguven: 9,
      takimUyumu: 9,
      liderlik: 8,
      ortalama: 8.75
    },
    katilimYuzdesi: 94,
    antrenmanSayisi: 22,
    davranissal: {
      kriterler: {
        fairPlay: 9,
        sorumlulukEkipman: 9,
        saygiIletisim: 9,
        yonergeyeUyum: 9,
        duyguKontrolu: 8,
        ortalama: 8.8
      },
      kazanimlar: [
        {
          baslik: 'Esneklik ve Denge Üstünlüğü',
          aciklama: 'Denge aleti ve yer hareketlerinde yaş grubunun üzerinde başarı.'
        }
      ],
      surecTakibi: [
        {
          donem: '1. Dönem',
          tarih: '2024-02-05',
          durum: 'Hedefe Ulaştı',
          odakKonusu: 'Denge & Odaklanma',
          gozlem: 'Koreografi hareketlerini başarıyla sergiledi.'
        }
      ],
      bagimlilikVeAliskanlik: {
        ekranDengesi: {
          puan: 9.0,
          seviye: 'Dengeli & Bilinçli',
          aciklama: 'Ekran süresi aile kontrolünde çok dengeli.'
        },
        zararliAliskanlik: {
          puan: 10,
          seviye: 'Bilinçli (Örnek)',
          aciklama: 'Şekerli gıdalar yerine meyve ve doğal beslenme.'
        },
        uykuVeDinlenme: {
          puan: 9.5,
          seviye: 'Düzenli (8+ Saat)',
          aciklama: 'Günde 9 saatten fazla düzenli uyku.'
        },
        genelFarkindalik: 'Örnek & Bilinçli',
        egitmenGorus: 'Melis yüksek motivasyonu ve esnekliğiyle öne çıkıyor.'
      },
      genelDegerlendirme: 'Melis jimnastik branşında çok yetenekli ve antrenman neşesi yüksek bir sporcudur.'
    },
    antrenorNotu: 'Melis yer serisinde akrobatik hareketleri çok temiz çıkarıyor. Kol kuvveti gelişimine devam.',
    gelisimAlanlari: ['Kol Kuvveti']
  },
  {
    id: 'k5',
    sporcuId: 's-5',
    adSoyad: 'Defne Şahin',
    brans: 'Yüzme',
    grup: 'Yıldız Yüzme Grubu',
    yasGubu: 'U11',
    tarih: '2024-02-01',
    antrenor: 'Burak Demir',
    boy: 148,
    kilo: 39,
    veliAdSoyad: 'Canan Şahin',
    veliTelefon: '+90 542 780 99 22',
    veliEposta: 'defnesahin@gmail.com',
    veliYakinlik: 'Anne',
    teknik: {
      topKontrolu: 9,
      pasBasarisi: 8,
      sut: 8,
      topSurme: 9,
      savunma: 8,
      ortalama: 8.4
    },
    fiziksel: {
      hiz: 9,
      dayaniklilik: 9,
      guc: 8,
      ceviklik: 9,
      ortalama: 8.75
    },
    taktiksel: {
      oyunZekasi: 9,
      pozisyonAlma: 8,
      kararVerme: 9,
      ortalama: 8.66
    },
    zihinsel: {
      disiplin: 9,
      ozguven: 9,
      takimUyumu: 9,
      liderlik: 8,
      ortalama: 8.75
    },
    katilimYuzdesi: 96,
    antrenmanSayisi: 30,
    davranissal: {
      kriterler: {
        fairPlay: 9,
        sorumlulukEkipman: 9,
        saygiIletisim: 9,
        yonergeyeUyum: 9,
        duyguKontrolu: 9,
        ortalama: 9.0
      },
      kazanimlar: [
        {
          baslik: 'Serbest & Sırtüstü Temposu',
          aciklama: '50m ve 100m serbest stilde sürelerini sürekli geliştiriyor.'
        }
      ],
      surecTakibi: [
        {
          donem: '1. Dönem',
          tarih: '2024-02-01',
          durum: 'Örnek Davranış',
          odakKonusu: 'Nefes Kontrolü & Dönüşler',
          gozlem: 'Havuz içi dönüş tekniğinde sıfır hata seviyesine geldi.'
        }
      ],
      bagimlilikVeAliskanlik: {
        ekranDengesi: {
          puan: 9.0,
          seviye: 'Dengeli & Bilinçli',
          aciklama: 'Yüzme idmanları öncesi dinlenmesine tam özen gösteriyor.'
        },
        zararliAliskanlik: {
          puan: 10,
          seviye: 'Bilinçli (Örnek)',
          aciklama: 'Temiz ve dengeli sporcu beslenmesi.'
        },
        uykuVeDinlenme: {
          puan: 9.0,
          seviye: 'Düzenli (8+ Saat)',
          aciklama: 'Sabah havuz antrenmanlarına dinç ve enerjik geliyor.'
        },
        genelFarkindalik: 'Örnek & Bilinçli',
        egitmenGorus: 'Defne çalışma ahlakıyla yüzme branşının gurur kaynağıdır.'
      },
      genelDegerlendirme: 'Defne kulaç kalitesi, su tutuşu ve yüksek aerobik kapasitesiyle çok başarılı bir yüzücüdür.'
    },
    antrenorNotu: 'Defne serbest stilde kulaç frekansını çok iyi koruyor. Kelebek stili nefes çalışması yapacağız.',
    gelisimAlanlari: ['Kelebek Tekniği']
  }
];

export const KARNELER_STORAGE_KEY = 'sportsfly_karneler_store_v1';

export function getStoredKarneler(): SporcuKarne[] {
  if (typeof window === 'undefined') return INITIAL_KARNELER;
  try {
    const raw = localStorage.getItem(KARNELER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((k: any) => {
          if (k?.davranissal?.bagimlilikVeAliskanlik?.zararliAliskanlik?.seviye === 'Temiz Spor (Örnek)') {
            k.davranissal.bagimlilikVeAliskanlik.zararliAliskanlik.seviye = 'Bilinçli (Örnek)';
          }
          if (k?.davranissal?.bagimlilikVeAliskanlik?.zararliAliskanlik?.aciklama) {
            k.davranissal.bagimlilikVeAliskanlik.zararliAliskanlik.aciklama = k.davranissal.bagimlilikVeAliskanlik.zararliAliskanlik.aciklama
              .replace(/temiz sporcu kimliği/gi, 'sağlıklı sporcu disiplini')
              .replace(/temiz spor/gi, 'sağlıklı yaşam');
          }
          // Fix legacy sporcuId mappings
          if (k.sporcuId === 's1' || k.adSoyad === 'Kaan Yıldırım') {
            k.sporcuId = 's-3';
          } else if (k.sporcuId === 's2' || k.adSoyad === 'Selman Utku') {
            k.sporcuId = 's-1';
          } else if (k.sporcuId === 's3' || k.adSoyad === 'Zeynep Kaya') {
            k.sporcuId = 's-2';
          } else if (k.sporcuId === 's4' || k.adSoyad === 'Melis Aksoy') {
            k.sporcuId = 's-4';
          } else if (k.sporcuId === 's5' || k.adSoyad === 'Defne Şahin') {
            k.sporcuId = 's-5';
          }
          // Ensure parent info exists
          if (!k.veliTelefon) {
            const initialMatch = INITIAL_KARNELER.find(ik => ik.id === k.id || ik.adSoyad === k.adSoyad);
            if (initialMatch) {
              k.veliAdSoyad = initialMatch.veliAdSoyad;
              k.veliTelefon = initialMatch.veliTelefon;
              k.veliEposta = initialMatch.veliEposta;
              k.veliYakinlik = initialMatch.veliYakinlik;
            } else {
              const surname = (k.adSoyad || '').split(' ').slice(-1)[0] || 'Veli';
              k.veliAdSoyad = `Ahmet ${surname}`;
              k.veliTelefon = '+90 532 555 01 23';
              k.veliEposta = `veli.${surname.toLowerCase()}@gmail.com`;
              k.veliYakinlik = 'Veli';
            }
          }
          return k;
        });
      }
    }
  } catch (e) {
    console.error('Error reading karneler from localStorage', e);
  }
  return INITIAL_KARNELER;
}

export function saveStoredKarneler(karneler: SporcuKarne[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KARNELER_STORAGE_KEY, JSON.stringify(karneler));
    window.dispatchEvent(new CustomEvent('sportsfly_karneler_updated', { detail: { karneler } }));
  } catch (e) {
    console.error('Error saving karneler to localStorage', e);
  }
}
