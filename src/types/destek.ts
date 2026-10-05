import { PackagePlanType } from '../types';

export type SupportTicketCategory =
  | 'teknik'
  | 'muhasebe'
  | 'paket'
  | 'egitim-planlama'
  | 'veli-karne'
  | 'entegrasyon'
  | 'oneri';

export type SupportTicketPriority = 'Dusuk' | 'Normal' | 'Yuksek' | 'Acil';

export type SupportTicketStatus =
  | 'Acik'
  | 'Yanitlandi'
  | 'MusteriYaniti'
  | 'Beklemede'
  | 'Cozuldu'
  | 'Kapali';

export interface SupportAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: 'club_admin' | 'sportsfly_agent' | 'system';
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  message: string;
  createdAt: string;
  attachments?: SupportAttachment[];
}

export interface SupportTicketFull {
  id: string;
  ticketNumber: number;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  clubName: string;
  clubPackage: PackagePlanType;
  clubBranch?: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  preferredContact: 'panel' | 'whatsapp' | 'email' | 'phone';
  messages: SupportMessage[];
  assignedAgent?: {
    name: string;
    title: string;
    avatar?: string;
    status: 'online' | 'busy' | 'offline';
  };
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: string;
  };
}

export interface FAQItem {
  id: string;
  category: SupportTicketCategory;
  question: string;
  summary: string;
  content: string[];
  tags: string[];
  readTime: string;
}
