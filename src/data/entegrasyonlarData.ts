import { EntegrasyonItem } from '../types';

export const INITIAL_INTEGRATIONS: EntegrasyonItem[] = [
  {
    id: 'int-sportsfly-lab',
    name: 'SportsFly Lab',
    category: 'Kulüp & Spor Modülleri',
    description: 'Beden kompozisyonu, motor performans, Heath-Carter Somatotip Analizi (Endomorfi, Mezomorfi, Ektomorfi Değişim Tablosu), kardiyorespiratuar (VO2peak) ve gelişim grafiklerini Excel ile içe aktararak profesyonel sporcu karnesi oluşturur.',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    iconName: 'Activity',
    isRecommended: true,
    isActive: true,
    isInternalModule: true,
    targetPage: 'sportsfly-lab',
    connectedAt: '27.09.2026',
  },
  {
    id: 'int-sporpuan',
    name: 'Sporpuan İtibar & Değerlendirme',
    category: 'Kulüp & Spor Modülleri',
    description: 'Sporcu teknik, taktik, devam ve fair-play puanlama altyapısı. Dijital rozetler ve federasyon onaylı karne entegrasyonu.',
    logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80',
    iconName: 'Star',
    isRecommended: true,
    isActive: true,
    isInternalModule: true,
    targetPage: 'sporpuan',
    connectedAt: '15.01.2024',
  },
  {
    id: 'int-turnuva',
    name: 'Turnuva & Fikstür Yönetimi',
    category: 'Kulüp & Spor Modülleri',
    description: 'Lig ve kupa organizasyonu, fikstür takvimi, anlık maç skoru girişi ve otomatik güncellenen puan durumu cetveli.',
    logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80',
    iconName: 'Trophy',
    isRecommended: true,
    isActive: true,
    isInternalModule: true,
    targetPage: 'turnuva-yonetimi',
    connectedAt: '01.03.2024',
  },
  {
    id: 'int-referans',
    name: 'Arkadaşını Tavsiye Et & %20 İndirim Programı',
    category: 'Kulüp & Spor Modülleri',
    description: 'Veli ve sporcuların kulübümüze yönlendirdiği yeni aileler için otomatik referans linki oluşturur. Tavsiye edilen sporcu devam ettiği sürece her ay %20 aidat indirimi tanımlar.',
    logoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
    iconName: 'Sparkles',
    isRecommended: true,
    isActive: true,
    isInternalModule: true,
    targetPage: 'referans-programi',
    connectedAt: '24.09.2024',
  },
];

const INTEGRATIONS_STORAGE_KEY = 'sportsfly_integrations_list_v2';

export function getStoredIntegrations(): EntegrasyonItem[] {
  try {
    // Check both v2 and legacy storage keys
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY) || localStorage.getItem('sportsfly_integrations_list_v1');
    let items = INITIAL_INTEGRATIONS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed.filter((i: EntegrasyonItem) => i.category === 'Kulüp & Spor Modülleri');
      }
    }

    if (items.length === 0) {
      items = INITIAL_INTEGRATIONS;
    }

    // Ensure int-referans exists
    const hasReferans = items.some((i) => i.id === 'int-referans');
    if (!hasReferans) {
      const refItem = INITIAL_INTEGRATIONS.find((i) => i.id === 'int-referans');
      if (refItem) {
        items = [refItem, ...items];
      }
    }

    // Ensure int-sportsfly-lab exists at the top
    const hasSportsFlyLab = items.some((i) => i.id === 'int-sportsfly-lab');
    if (!hasSportsFlyLab) {
      const labItem = INITIAL_INTEGRATIONS.find((i) => i.id === 'int-sportsfly-lab');
      if (labItem) {
        items = [labItem, ...items];
      }
    }

    // Sanitize items
    const sanitized: EntegrasyonItem[] = items.map((item: EntegrasyonItem) => {
      if (item.id === 'int-sporpuan') {
        return {
          ...item,
          name: 'Sporpuan İtibar & Değerlendirme',
          description: 'Sporcu teknik, taktik, devam ve fair-play puanlama altyapısı. Dijital rozetler ve federasyon onaylı karne entegrasyonu.',
        };
      }
      return {
        ...item,
        name: item.name ? item.name.replace(/SporPuan/g, 'Sporpuan').replace(/Spor Puan/g, 'Sporpuan') : item.name,
        description: item.description ? item.description.replace(/SporPuan/g, 'Sporpuan').replace(/Spor Puan/g, 'Sporpuan') : item.description,
      };
    });
    return sanitized;
  } catch (e) {
    console.error('Entegrasyonlar yüklenirken hata:', e);
  }
  return INITIAL_INTEGRATIONS;
}

export function saveStoredIntegrations(items: EntegrasyonItem[]): void {
  try {
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('sportsfly_integrations_updated'));
  } catch (e) {
    console.error('Entegrasyonlar kaydedilirken hata:', e);
  }
}
