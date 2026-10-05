export interface AnketQuestion {
  id: string;
  text: string;
  type: 'rating' | 'boolean' | 'text';
  stats?: {
    avgRating?: number;
    yesCount?: number;
    noCount?: number;
    answers?: string[];
    distribution?: { label: string; count: number; percent: number }[];
  };
}

export interface AnketItem {
  id: string;
  title: string;
  description: string;
  targetAudience: 'Sporcu' | 'Veli' | 'Eğitmen' | 'Genel';
  status: 'Aktif' | 'Taslak' | 'Tamamlandı';
  responseCount: number;
  totalSent: number;
  createdAt: string;
  dueDate: string;
  questions: AnketQuestion[];
}

export const INITIAL_ANKETLER: AnketItem[] = [
  {
    id: 'anket-1',
    title: 'Eğitmen Değerlendirme Anketi',
    description: 'Dönem sonu eğitmen performansı, iletişim ve antrenman kalitesi ölçümü.',
    targetAudience: 'Sporcu',
    status: 'Aktif',
    responseCount: 84,
    totalSent: 120,
    createdAt: '2023-10-01',
    dueDate: '2023-11-01',
    questions: [
      {
        id: 'q1',
        text: 'Eğitmeninizin antrenman sırasındaki iletişiminden memnun musunuz?',
        type: 'boolean',
        stats: {
          yesCount: 78,
          noCount: 6,
          distribution: [
            { label: 'Evet', count: 78, percent: 93 },
            { label: 'Hayır', count: 6, percent: 7 }
          ]
        }
      },
      {
        id: 'q2',
        text: 'Antrenman verimliliğini 1-5 arası nasıl puanlarsınız?',
        type: 'rating',
        stats: {
          avgRating: 4.6,
          distribution: [
            { label: '5 Puan', count: 50, percent: 60 },
            { label: '4 Puan', count: 28, percent: 33 },
            { label: '3 Puan', count: 4, percent: 5 },
            { label: '2 Puan', count: 2, percent: 2 },
            { label: '1 Puan', count: 0, percent: 0 }
          ]
        }
      },
      {
        id: 'q3',
        text: 'Eğitmeninizle ilgili eklemek istediğiniz bir not var mı?',
        type: 'text',
        stats: {
          answers: [
            'Çok motive edici bir hoca.',
            'Bazen antrenmanlar çok yorucu oluyor ama geliştiğimi hissediyorum.',
            'İletişimi harika, takım ruhunu çok iyi sağlıyor.'
          ]
        }
      }
    ]
  },
  {
    id: 'anket-2',
    title: 'Veli Süreç & Memnuniyet Anketi',
    description: 'Velilerimizin kulüp yönetimi, tesis ve iletişim süreçleri hakkındaki görüşleri.',
    targetAudience: 'Veli',
    status: 'Tamamlandı',
    responseCount: 145,
    totalSent: 150,
    createdAt: '2023-08-15',
    dueDate: '2023-09-01',
    questions: [
      {
        id: 'q1',
        text: 'Tesisin hijyen ve düzenini nasıl buluyorsunuz?',
        type: 'rating',
        stats: {
          avgRating: 4.2,
          distribution: [
            { label: '5 Puan', count: 60, percent: 41 },
            { label: '4 Puan', count: 65, percent: 45 },
            { label: '3 Puan', count: 15, percent: 10 },
            { label: '2 Puan', count: 5, percent: 4 },
            { label: '1 Puan', count: 0, percent: 0 }
          ]
        }
      },
      {
        id: 'q2',
        text: 'Yönetimle iletişim kurmakta zorluk yaşıyor musunuz?',
        type: 'boolean',
        stats: {
          yesCount: 15,
          noCount: 130,
          distribution: [
            { label: 'Evet (Zorlanıyorum)', count: 15, percent: 10 },
            { label: 'Hayır (Zorlanmıyorum)', count: 130, percent: 90 }
          ]
        }
      }
    ]
  },
  {
    id: 'anket-3',
    title: 'Eğitmen Motivasyon ve Çalışma Ortamı',
    description: 'Eğitmenlerimizin çalışma koşulları ve ihtiyaçları hakkında geri bildirim anketi.',
    targetAudience: 'Eğitmen',
    status: 'Taslak',
    responseCount: 0,
    totalSent: 0,
    createdAt: '2023-11-15',
    dueDate: '2023-12-15',
    questions: [
      {
        id: 'q1',
        text: 'Ekipman yeterliliği konusunda düşünceniz nedir?',
        type: 'rating'
      },
      {
        id: 'q2',
        text: 'Çalışma saatlerinizin planlanmasından memnun musunuz?',
        type: 'boolean'
      },
      {
        id: 'q3',
        text: 'İhtiyaç duyduğunuz ek materyaller nelerdir?',
        type: 'text'
      }
    ]
  }
];
