export interface LegalDoc {
  id: 'kullanim-kosullari' | 'kvkk' | 'gizlilik' | 'acik-riza' | 'fotograf-video' | 'iletisim' | 'veli-onay';
  title: string;
  badge: string;
  subtitle: string;
  companyInfo: {
    unvan: string;
    adres: string;
    mersis?: string;
    vergiNo?: string;
    eposta: string;
    telefon: string;
  };
  lastUpdated: string;
  sections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
  }[];
  summary: string;
}

export const LEGAL_TEXTS: Record<string, LegalDoc> = {
  'kullanim-kosullari': {
    id: 'kullanim-kosullari',
    title: 'Kullanım Koşulları ve Üyelik Sözleşmesi',
    badge: 'Hizmet ve Platform Şartları',
    subtitle: 'SportsFly Spor Okulu, Akademi ve Tesis Yönetim Platformu Kullanım Esasları',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Caferağa Mah. Moda Cad. No: 42/3 Kadıköy / İstanbul',
      mersis: '0781054238900012',
      vergiNo: 'Kadıköy V.D. 7810542389',
      eposta: 'hukuk@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'SportsFly yazılım platformuna erişim sağlayan kulüp yöneticileri, antrenörler, sporcular ve veliler için geçerli olan platform kullanım kuralları, hak ve yükümlülükler, telif hakları ve hesap güvenliği şartlarını içerir.',
    sections: [
      {
        heading: '1. Taraflar ve Amaç',
        content:
          'İşbu Kullanım Koşulları ("Sözleşme"), Sporsepeti Bilişim Teknolojileri Ltd. Şti. ("SportsFly" veya "Şirket") ile SportsFly web ve mobil uygulamalarını kullanan kulüp, antrenör, veli ve sporcular ("Kullanıcı") arasında akdedilmiştir. Sözleşmenin amacı, platform üzerinden sunulan spor okulu yönetimi, yoklama takibi, aidat tahsilatı, performans ölçümü ve iletişim hizmetlerinden faydalanma şartlarını belirlemektir.',
      },
      {
        heading: '2. Hesap Oluşturma ve Güvenlik',
        content:
          'Kullanıcı, platforma kayıt olurken ve giriş yaparken sağladığı tüm bilgilerin (ad, soyad, telefon, e-posta, T.C. kimlik numarası vb.) doğru, güncel ve eksiksiz olduğunu beyan eder.',
        bulletPoints: [
          'Kullanıcı giriş şifresini ve SMS doğrulama kodlarını üçüncü kişilerle paylaşamaz.',
          'Hesap üzerinden gerçekleştirilen tüm işlemlerden doğrudan ilgili Kullanıcı sorumludur.',
          'Yetkisiz erişim şüphesi durumunda derhal SportsFly destek ekibine (0216 850 1907) bilgi verilmelidir.',
          '18 yaşından küçük sporcuların hesapları yalnızca yasal veli veya vasisi tarafından yönetilebilir veya onaylanabilir.',
        ],
      },
      {
        heading: '3. Hizmet Kapsamı ve Fikri Mülkiyet',
        content:
          'SportsFly arayüzü, yazılım kodları, veritabanı mimarisi, tasarımları, logoları ve algoritmaları münhasıran Şirket\'e aittir. Kullanıcı platformu kopyalayamaz, tersine mühendislik yapamaz, sistem güvenliğini ihlal edici otomatik sorgu/bot yazılımları kullanamaz.',
      },
      {
        heading: '4. Ödeme, Aidat ve Finansal Modül İşlemleri',
        content:
          'SportsFly, spor kulüpleri ile veliler arasındaki aidat, lisans, kamp ve ürün ödemelerinde güvenli altyapı sağlayıcı olarak rol alır. Tahsilat süreçleri BDDK ve TCMB lisanslı ödeme kuruluşları altyapısıyla 256-bit SSL şifrelemeyle yürütülür.',
      },
      {
        heading: '5. Sorumluluk Sınırları ve Hizmet Sürekliliği',
        content:
          'SportsFly, platformun kesintisiz ve hatasız çalışması için azami özeni gösterir. Planlı bakım çalışmaları önceden duyurulur. Mücbir sebepler, telekomünikasyon altyapı kesintileri veya kullanıcı donanımından kaynaklanan aksaklıklardan doğrudan Şirket sorumlu tutulamaz.',
      },
      {
        heading: '6. Yürürlük ve Yetkili Mahkeme',
        content:
          'Kullanıcı, platforma giriş yaparak veya "Giriş Yap / Kayıt Ol" butonlarına basarak bu şartları kabul etmiş sayılır. İşbu sözleşmeden doğabilecek uyuşmazlıklarda İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir.',
      },
    ],
  },

  kvkk: {
    id: 'kvkk',
    title: 'KVKK Aydınlatma Metni',
    badge: '6698 Sayılı Kanun Uyarınca',
    subtitle: 'Kişisel Verilerin İşlenmesi ve Korunması Hakkında Aydınlatma Metni',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Caferağa Mah. Moda Cad. No: 42/3 Kadıköy / İstanbul',
      mersis: '0781054238900012',
      vergiNo: 'Kadıköy V.D. 7810542389',
      eposta: 'kvkk@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti. (Kadıköy/İstanbul) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla sporcu ve velilerimize ait kişisel verileri yasal sınırlar ve meşru amaçlar çerçevesinde titizlikle koruyor ve işliyoruz.',
    sections: [
      {
        heading: '1. Veri Sorumlusunun Kimliği',
        content:
          '6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu olarak "Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti." (Kadıköy/İstanbul) ("Şirket" veya "SportsFly") tarafından aşağıda açıklanan kapsamda işlenebilecektir.',
      },
      {
        heading: '2. İşlenen Kişisel Veri Kategorileri',
        content:
          'Ön kayıt, kesin kayıt, antrenman ve kulüp yönetim süreçlerimizde tarafınızca veya velisi bulunduğunuz sporcu tarafından sağlanan şu kategorilerdeki veriler işlenmektedir:',
        bulletPoints: [
          'Kimlik Bilgileri: Ad, soyad, T.C. kimlik numarası, doğum tarihi, cinsiyet.',
          'İletişim Bilgileri: Veli ve sporcu telefon numarası, e-posta adresi, ikamet adresi.',
          'Sağlık ve Fiziksel Bilgiler: Boy, kilo, kronik rahatsızlık, alerji durumu, kullanılan düzenli ilaçlar, spor yapmaya elverişlilik beyanı, acil durumda aranacak kişi bilgileri.',
          'Eğitim ve Meslek Bilgileri: Sporcunun eğitim durumu, veli mesleği ve eğitim düzeyi.',
          'Finansal ve Muhasebe Bilgileri: Sözleşme bedeli, ödeme yöntemi ve makbuz/fatura bilgileri.',
          'İşlem ve Talep Bilgileri: İlgilenilen spor branşı, şube tercihi, görüşme notları ve tercih edilen gün/saatler.',
        ],
      },
      {
        heading: '3. Kişisel Verilerin İşlenme Amaçları',
        content:
          'Kişisel verileriniz KVKK\'nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde;',
        bulletPoints: [
          'Spor okulu ve kulüp ön kayıt başvurularının alınması, değerlendirilmesi ve kesin kayda dönüştürülmesi,',
          'Sporcunun yaş, boy, kilo ve fiziksel özelliklerine uygun yaş kategorisi ve antrenman gruplarının belirlenmesi,',
          'Antrenman, maç veya etkinlikler sırasında meydana gelebilecek ani sağlık sorunlarında ilk yardımın sağlanması ve acil durum irtibat kişisine ulaşılması,',
          'Veli ile antrenman programları, aidat ödemeleri, kamp ve turnuva süreçlerine ilişkin iletişimin kurulması,',
          'Yasal mevzuattan kaynaklanan bilgi saklama, raporlama ve Gençlik ve Spor Bakanlığı/Federasyon lisans bildirim yükümlülüklerinin ifası,',
          'Kulüp operasyonlarının planlanması, müşteri memnuniyeti ve hizmet kalitesinin artırılması amaçlarıyla işlenmektedir.',
        ],
      },
      {
        heading: '4. Kişisel Verilerin Aktarılması',
        content:
          'Kişisel verileriniz; kanunen yetkili kamu kurum ve kuruluşlarına (Gençlik ve Spor Bakanlığı, ilgili Spor Federasyonları, adli ve idari merciler), acil tıbbi müdahale gerektiren hallerde yetkili sağlık kuruluşlarına ve acil servis birimlerine, mevzuata uygun olarak bilgi güvenliği standartları sağlanarak aktarılabilmektedir. Kişisel verileriniz ticari veya reklam amacıyla izniniz olmaksızın hiçbir üçüncü tarafa devredilmez.',
      },
      {
        heading: '5. Veri Toplama Yöntemi ve Hukuki Sebepleri',
        content:
          'Kişisel verileriniz; web sitemiz, SportsFly ön kayıt portalları, mobil uygulamalar, WhatsApp ve çağrı merkezi görüşmeleri, yüz yüze mülakatlar ve basılı kayıt formları aracılığıyla elektronik ve fiziki ortamda toplanmaktadır. Hukuki sebepler: Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (KVKK m.5/2-c), veri sorumlusunun hukuki yükümlülüğü (m.5/2-ç), ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaat (m.5/2-f) ve özel nitelikli veriler için Açık Rıza (m.6/2) şartlarıdır.',
      },
      {
        heading: '6. KVKK Madde 11 Kapsamındaki Haklarınız',
        content:
          'Kişisel veri sahibi olarak Şirketimize başvurarak;',
        bulletPoints: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme,',
          'İşlenmişse buna ilişkin bilgi talep etme,',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
          'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme,',
          'KVKK mevzuatına uygun olarak silinmesini veya yok edilmesini talep etme,',
          'Verilerin düzeltilmesi veya silinmesi işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz.',
        ],
      },
      {
        heading: '7. İletişim ve Başvuru',
        content:
          'Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tevsik edici belgelerle birlikte kvkk@sporsepeti.com.tr e-posta adresine güvenli elektronik imzalı olarak veya "Caferağa Mah. Moda Cad. No: 42/3 Kadıköy / İstanbul" adresimize yazılı ve ıslak imzalı olarak başvurabilirsiniz. Ayrıca form ve başvuru süreçleriniz için 0216 850 1907 numaralı kurumsal iletişim hattımızdan destek alabilirsiniz.',
      },
    ],
  },

  gizlilik: {
    id: 'gizlilik',
    title: 'Gizlilik ve Çerez (Cookie) Politikası',
    badge: 'Veri Güvenliği ve Gizlilik',
    subtitle: 'Kullanıcı Bilgilerinin Korunması, Şifreleme ve Çerez Standartları',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Caferağa Mah. Moda Cad. No: 42/3 Kadıköy / İstanbul',
      eposta: 'gizlilik@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'SportsFly, kullanıcılarının gizliliğini en yüksek öncelikle korur. Platformda kullanılan şifreleme yöntemleri, veri saklama protokolleri, çerez türleri ve kullanıcı tercihleri bu metinde açıklanmıştır.',
    sections: [
      {
        heading: '1. Veri Güvenliği ve Şifreleme',
        content:
          'SportsFly üzerinde depolanan tüm hassas veriler, uluslararası kabul görmüş AES-256 şifreleme standartları ve TLS 1.3 bağlantı protokolleri ile korunmaktadır. Kullanıcı şifreleri tek yönlü tuzlanmış karma (salted hash) algoritmalarıyla saklanır ve hiçbir şirket personeli tarafından açık metin olarak görülemez.',
      },
      {
        heading: '2. Çerezler (Cookies) ve Kullanım Amaçları',
        content:
          'Platformumuzda kullanıcı deneyimini iyileştirmek, oturum güvenliğini sağlamak ve tercihlerinizi hatırlamak amacıyla çerezler kullanılmaktadır:',
        bulletPoints: [
          'Zorunlu Çerezler: Giriş oturumunun korunması ve güvenlik doğrulamaları için elzemdir.',
          'İşlevsel Çerezler: Dil seçimi (TR/EN), tema ve kullanıcı arayüz tercihlerini hatırlar.',
          'Analitik Çerezler: Platformun performansını optimize etmek ve sayfa yükleme hızlarını ölçmek amacıyla anonim olarak tutulur.',
        ],
      },
      {
        heading: '3. Üçüncü Taraf Entegrasyonları',
        content:
          'SportsFly, yalnızca lisanslı SMS sağlayıcıları, e-fatura entegratörleri ve BDDK lisanslı ödeme kuruluşları ile entegre çalışır. Hiçbir veri reklamverenlere veya veri simsarlarına satılamaz veya ticari amaçla paylaşılamaz.',
      },
      {
        heading: '4. Veri Saklama ve İmha Süresi',
        content:
          'Kişisel veriler, yasal mevzuatta öngörülen süreler (Gençlik Spor Bakanlığı düzenlemeleri, Vergi Usul Kanunu ve TTK saklama süreleri) boyunca güvenli sunucularda saklanır; sürenin bitiminde periyodik imha süreçlerine tabi tutulur.',
      },
    ],
  },

  'acik-riza': {
    id: 'acik-riza',
    title: 'Özel Nitelikli Kişisel Veri Açık Rıza Metni',
    badge: 'KVKK Madde 6 Kapsamında',
    subtitle: 'Sağlık ve Fiziksel Verilerin İşlenmesine İlişkin Açık Rıza Beyanı',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Kadıköy / İstanbul',
      eposta: 'kvkk@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'Sporcunun spor aktiviteleri sırasında can güvenliği, antrenman uygunluğu ve acil sağlık müdahalelerinin doğru yönetilebilmesi adına sağlanan sağlık verilerinin işlenmesine ilişkin açık rıza beyanıdır.',
    sections: [
      {
        heading: '1. Açık Rızanın Konusu ve Kapsamı',
        content:
          'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti. ("Şirket") tarafından sunulan Aydınlatma Metni\'ni okuduğumu, incelediğimi ve anladığımı kabul ederim. 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca özel nitelikli kişisel veri sayılan;',
        bulletPoints: [
          'Sporcunun geçmiş ve mevcut sağlık durumu (alerjiler, astım, kalp rahatsızlıkları, ortopedik ameliyatlar vb.),',
          'Düzenli olarak kullandığı ilaçlar ve tıbbi uyarılar,',
          'Boy, kilo ve fiziksel gelişim ölçüm parametreleri,',
          'Spor yapmasında herhangi bir medikal kısıt veya engel olup olmadığı bilgisi,',
          'Acil durumlarda aranacak birinci derece yakın ve acil sağlık bilgileri.',
        ],
      },
      {
        heading: '2. İşleme Amaçları ve Güvenceler',
        content:
          'Yukarıda sayılan verilerin; sporcunun antrenman kapasitesinin doğru tespit edilmesi, antrenörlerin olası sağlık risklerine karşı önceden uyarılması, antrenman ve müsabaka esnasında yaşanabilecek kaza, bayılma, sakatlanma veya yaralanma hallerinde ilk yardım personelinin doğru bilgilendirilmesi ve acil sağlık kuruluşlarına yönlendirilmesi amaçlarıyla sınırlı olarak işlenmesine ve teknik güvenlik tedbirleri alınmış sistemlerde muhafaza edilmesine açıkça rıza gösteriyorum.',
      },
      {
        heading: '3. Rızanın Geri Alınması',
        content:
          'İşbu açık rızamı dilediğim zaman Şirket\'e kvkk@sporsepeti.com.tr üzerinden yazılı başvuruda bulunarak geri alma hakkımın bulunduğunu, rızanın geri alınmasının geri alma tarihine kadar gerçekleştirilmiş olan işlemleri hukuka aykırı kılmayacağını biliyorum.',
      },
    ],
  },

  'fotograf-video': {
    id: 'fotograf-video',
    title: 'Fotoğraf ve Video Kullanım İzni',
    badge: 'Görsel ve İşitsel Kayıt Muvafakati',
    subtitle: 'Sosyal Medya, Kulüp Web Sitesi ve Faaliyet Tanıtımları İzin Belgesi',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Kadıköy / İstanbul',
      eposta: 'iletisim@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'Antrenmanlar, maçlar, kupa törenleri ve kulüp etkinliklerinde çekilen görsel/işitsel kayıtların veli ve sporcunun onurunu zedelemeyecek şekilde spor sevgisini teşvik ve kulüp faaliyetlerinin duyurulması amacıyla kullanılmasına dair izin metnidir.',
    sections: [
      {
        heading: '1. Çekim ve Kullanım Kapsamı',
        content:
          'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti. ve/veya yetkilendirdiği spor kulübü bünyesinde gerçekleştirilen antrenmanlar, resmi ve özel müsabakalar, turnuvalar, yaz/kış spor kampları ve ödül törenleri esnasında sporcunun ve gerektiğinde etkinlik alanındaki velinin görüntülerinin (fotoğraf ve video) çekilmesine;',
      },
      {
        heading: '2. Yayın Mecraları ve Amaç',
        content:
          'Çekilen görsel ve işitsel kayıtların yalnızca:',
        bulletPoints: [
          'Kulübün ve Sporsepeti / SportsFly\'ın resmi internet sitelerinde (web sayfalarında),',
          'Kulübün resmi sosyal medya hesaplarında (Instagram, YouTube, LinkedIn, Facebook vb.),',
          'Sporcu gelişim arşivinde, kulüp içi bilgilendirme panolarında ve sezon sonu hatıra bültenlerinde,',
          'Spor okulu başarılarının, turnuva sonuçlarının ve spor kültürünün kamuoyuna tanıtılması amacıyla kullanılmasına izin veriyorum.',
        ],
      },
      {
        heading: '3. Koruma Şartı ve İptal Hakkı',
        content:
          'Hiçbir görsel veya video kaydının sporcunun onur, şeref veya kişilik haklarına aykırı, küçük düşürücü veya ticari bir üçüncü tarafa satılacak mahiyette kullanılamayacağını kabul ve taahhüt ederiz. Veli dilediği an yazılı bildirim veya 0216 850 1907 destek hattı üzerinden belirli bir paylaşımın kaldırılmasını veya genel fotoğraf izninin iptal edilmesini talep edebilir.',
      },
    ],
  },

  iletisim: {
    id: 'iletisim',
    title: 'Ticari Elektronik İleti ve İletişim İzni',
    badge: '6563 Sayılı ETK Uyarınca',
    subtitle: 'SMS, WhatsApp, E-posta ve Arama Yoluyla Bilgilendirme Onayı',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Kadıköy / İstanbul',
      eposta: 'destek@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      '6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca antrenman saatleri, kamp duyuruları, yeni dönem erken kayıt indirimleri ve kulüp bilgilendirmelerinin veliye ulaştırılmasına dair onay metnidir.',
    sections: [
      {
        heading: '1. İletişim Onayının Niteliği',
        content:
          '6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik kapsamında, Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti. ("Şirket") ve iş ortaklığı yürüttüğü spor kulübü tarafından;',
      },
      {
        heading: '2. İletişim Kanalları ve İçerikler',
        content:
          'Tarafımca paylaşılan telefon numarası, mobil mesajlaşma uygulamaları (WhatsApp, Telegram vb.) ve e-posta adresime;',
        bulletPoints: [
          'Antrenman programı güncellemeleri, saat/salon değişiklikleri ve hava muhalefeti duyuruları,',
          'Turnuva, maç takvimi, kamp programları ve sporcu gelişim raporu bildirimleri,',
          'Yeni dönem kayıt takvimleri, kardeş ve erken kayıt indirimleri, kulüp kampanyaları ve spor giyim/ekipman avantajları,',
          'Kulüp etkinlik davetiyeleri ve memnuniyet anketleri gibi içeriklerin SMS, e-posta ve otomatik sesli arama ile iletilmesini kabul ediyorum.',
        ],
      },
      {
        heading: '3. Ret (İptal) Hakkı ve İYS Bildirimi',
        content:
          'İleti gönderilmesine ilişkin verdiğim onayı, hiçbir gerekçe göstermeksizin dilediğim zaman ücretsiz olarak geri alma (ret) hakkına sahibim. Gelen SMS içerisindeki ret linkini kullanarak, İYS (İleti Yönetim Sistemi) üzerinden veya 0216 850 1907 destek hattından destek@sporsepeti.com.tr adresine bildirimde bulunarak iletişim listesinden derhal çıkabilirim.',
      },
    ],
  },

  'veli-onay': {
    id: 'veli-onay',
    title: 'Veli İzin, Muvafakatname ve Sorumluluk Beyanı',
    badge: 'Yasal Vasi Onayı',
    subtitle: 'Kulüp Katılımı, Tesis Kuralları ve Sağlık Beyanı Taahhütnamesi',
    companyInfo: {
      unvan: 'Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti.',
      adres: 'Kadıköy / İstanbul',
      eposta: 'info@sporsepeti.com.tr',
      telefon: '0216 850 1907',
    },
    lastUpdated: '18 Eylül 2026',
    summary:
      'Velisi/vasisi bulunulan sporcunun antrenman, maç ve spor okulu faaliyetlerine katılmasına, formda girilen bilgilerin doğruluğuna ve kulüp iç tüzüğüne riayet edilmesine dair yasal veli taahhüdüdür.',
    sections: [
      {
        heading: '1. Velayet ve Katılım Muvafakati',
        content:
          'Velisi / vasisi bulunduğum sporcunun, Sporsepeti altyapısında faaliyet gösteren spor kulübünün düzenleyeceği antrenmanlara, hazırlık ve resmi maçlara, ölçüm ve test faaliyetlerine, kulüp içi spor etkinliklerine katılmasına rıza gösteriyor ve izin veriyorum.',
      },
      {
        heading: '2. Sağlık ve Bilgi Doğruluğu Beyanı',
        content:
          'Ön kayıt formunda beyan ettiğim sporcu ve veli bilgilerinin, T.C. kimlik numaralarının, iletişim ve adres verilerinin eksiksiz ve doğru olduğunu;',
        bulletPoints: [
          'Sporcunun spor faaliyetlerine katılmasına engel olabilecek bilinen herhangi bir fiziksel, zihinsel veya kardiyolojik rahatsızlığı olmadığını,',
          'Mevcut alerjiler, kullanılan düzenli ilaçlar ve kronik durumların kayıt formunda eksiksiz beyan edildiğini,',
          'Süreç içerisinde sporcunun sağlık durumunda meydana gelebilecek herhangi bir değişikliği derhal kulüp yönetimine ve antrenörüne bildireceğimi,',
          'Gerekli durumlarda kulübün talep edeceği "Spor Yapabilir" sağlık raporunu kesin kayıt esnasında ibraz edeceğimi taahhüt ederim.',
        ],
      },
      {
        heading: '3. Tesis Kuralları ve Disiplin Taahhüdü',
        content:
          'Sporcunun ve antrenman alanını ziyaret eden velilerin tesis kurallarına, antrenörlerin direktiflerine, fair-play ve spor ahlakı ilkelerine uymakla yükümlü olduğunu; kulüp demirbaşlarına kasten verilen zararların veli tarafından karşılanacağını, sporcu güvenliği ve grup düzenini bozan davranışlarda kulübün sözleşmeyi feshetme yetkisi olduğunu bildiğimi ve kabul ettiğimi beyan ederim.',
      },
      {
        heading: '4. Yürürlük ve Onay',
        content:
          'İşbu taahhütnamenin tüm maddelerini okuduğumu, velisi bulunduğum sporcu adına hür irademle onayladığımı ve hukuken bağlayıcı olduğunu kabul ve beyan ederim.',
      },
    ],
  },
};
