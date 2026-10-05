import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { FAQ_KNOWLEDGE_BASE, SUPPORT_CATEGORIES } from '../../../data/mockDestekData';
import { SupportTicketCategory } from '../../../types/destek';

interface FAQKnowledgeBaseViewProps {
  onOpenNewTicket: () => void;
}

export const FAQKnowledgeBaseView: React.FC<FAQKnowledgeBaseViewProps> = ({
  onOpenNewTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQ_KNOWLEDGE_BASE.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="bg-white dark:bg-[#111c2e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sıkça sorulan sorular, modüller, kurulum veya hata çözümü ara..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tüm Konular ({FAQ_KNOWLEDGE_BASE.length})
          </button>
          {SUPPORT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#162238]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {faq.readTime}
                      </span>
                      {faq.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-slate-400 dark:text-slate-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {faq.summary}
                    </p>
                  </div>

                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-[#162238]/30 space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {faq.content.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Bu rehber sorununuzu çözdü mü?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                        >
                          👍 Evet, Çözüldü
                        </button>
                        <button
                          type="button"
                          onClick={onOpenNewTicket}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold cursor-pointer"
                        >
                          👎 Hayır, Destek Talebi Aç
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Aramanızla eşleşen rehber bulunamadı
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Doğrudan SportsFly teknik ekibine destek talebi iletebilirsiniz.
            </p>
            <button
              onClick={onOpenNewTicket}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Yeni Destek Talebi Aç
            </button>
          </div>
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SportsFlyIcon className="w-4 h-4 text-white" />
            <h4 className="text-sm font-bold">Acil Durum &amp; Canlı Telefon Desteği</h4>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Turnuva günü seans kilitlenmesi veya Sanal POS acil durumlarında 7/24 nöbetçi SportsFly destek hattımızla doğrudan iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <a
            href="https://wa.me/908503080000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp Destek Hattı</span>
          </a>
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Talep Gönder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
