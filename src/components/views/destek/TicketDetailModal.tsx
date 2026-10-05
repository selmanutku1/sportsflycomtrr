import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Phone,
  Bot,
  Star,
  Download,
  AlertCircle,
  CornerDownRight,
  MessageSquare,
  Building2,
  Share2,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import {
  SupportTicketFull,
  SupportMessage,
  SupportAttachment,
} from '../../../types/destek';
import { SUPPORT_CATEGORIES } from '../../../data/mockDestekData';
import { getStoredUserProfile } from '../../../data/userProfile';

interface TicketDetailModalProps {
  ticket: SupportTicketFull | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (ticketId: string, messageText: string, attachments?: SupportAttachment[]) => void;
  onUpdateStatus: (ticketId: string, newStatus: any, feedback?: { rating: number; comment?: string; submittedAt: string }) => void;
  onTriggerSimulatedAgentReply: (ticketId: string, customPrompt?: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSendMessage,
  onUpdateStatus,
  onTriggerSimulatedAgentReply,
}) => {
  const userProfile = getStoredUserProfile();
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [rating, setRating] = useState<number>(ticket?.feedback?.rating || 5);
  const [ratingComment, setRatingComment] = useState(ticket?.feedback?.comment || '');
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  if (!isOpen || !ticket) return null;

  const categoryMeta = SUPPORT_CATEGORIES.find((c) => c.id === ticket.category);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) return;

    onSendMessage(ticket.id, replyText.trim(), attachments.length > 0 ? attachments : undefined);
    setReplyText('');
    setAttachments([]);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      const files: SupportAttachment[] = filesArray.map((f: File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const handleSimulateReply = () => {
    setIsSimulatingAgent(true);
    setTimeout(() => {
      onTriggerSimulatedAgentReply(ticket.id);
      setIsSimulatingAgent(false);
    }, 800);
  };

  const handleSaveRating = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    onUpdateStatus(ticket.id, 'Cozuldu', {
      rating,
      comment: ratingComment,
      submittedAt: timeStr,
    });
    setShowRatingSuccess(true);
    setTimeout(() => setShowRatingSuccess(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Acik':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Yanitlandi':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'MusteriYaniti':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Beklemede':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Cozuldu':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'Kapali':
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Acik':
        return 'Yeni / İncelemede';
      case 'Yanitlandi':
        return 'SportsFly Yanıtladı';
      case 'MusteriYaniti':
        return 'Kulüp Yanıtı Eklendi';
      case 'Beklemede':
        return 'Teknik İncelemede';
      case 'Cozuldu':
        return 'Sorun Çözüldü';
      case 'Kapali':
        return 'Kapatıldı';
      default:
        return status;
    }
  };

  const isResolvedOrClosed = ticket.status === 'Cozuldu' || ticket.status === 'Kapali';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[90vh] overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#162238]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-sm shrink-0">
              #{ticket.id}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {categoryMeta?.name || ticket.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ticket.priority === 'Acil'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      : ticket.priority === 'Yuksek'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Öncelik: {ticket.priority}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate mt-0.5">
                {ticket.subject}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Action buttons */}
            {!isResolvedOrClosed ? (
              <button
                onClick={() => onUpdateStatus(ticket.id, 'Cozuldu')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
                title="Sorun çözüldü olarak işaretle"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Çözüldü Olarak İşaretle</span>
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(ticket.id, 'Acik')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Talebi Tekrar Aç</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assigned Specialist & Ticket Metadata Banner */}
        <div className="px-6 py-2.5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={
                  ticket.assignedAgent?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={ticket.assignedAgent?.name || 'Destek Temsilcisi'}
                className="w-7 h-7 rounded-full object-cover border border-blue-200"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-1 ring-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {ticket.assignedAgent?.name || 'Emre Yılmaz'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                {ticket.assignedAgent?.title || 'SportsFly Kıdemli Destek Uzmanı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Oluşturulma: <strong>{ticket.createdAt}</strong></span>
            {ticket.clubBranch && <span>Şube: <strong>{ticket.clubBranch}</strong></span>}
            <span>Paket: <strong className="text-blue-600 dark:text-blue-400">{ticket.clubPackage}</strong></span>
          </div>

          {/* Quick Specialist Simulation Trigger for Demo */}
          <button
            onClick={handleSimulateReply}
            disabled={isSimulatingAgent}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="SportsFly destek uzmanından anında yanıt alarak akışı test edin"
          >
            <SportsFlyIcon className="w-3.5 h-3.5" />
            <span>{isSimulatingAgent ? 'Yanıt Yazılıyor...' : 'SportsFly\'dan Yanıt Al (Simülasyon)'}</span>
          </button>
        </div>

        {/* Conversation Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-[#0b1320]/40">
          {ticket.messages.map((msg, index) => {
            const isAgent = msg.senderType === 'sportsfly_agent';
            const isClub = msg.senderType === 'club_admin';

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 ${isClub ? 'flex-row-reverse' : 'flex-row'} items-start`}
              >
                {/* Avatar */}
                {isAgent ? (
                  <div className="relative shrink-0">
                    <img
                      src={
                        msg.senderAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={msg.senderName}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-blue-500 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-md">
                      <Shield className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-xl rounded-2xl p-4 shadow-2xs space-y-2 ${
                    isAgent
                      ? 'bg-white dark:bg-[#162238] border border-blue-100 dark:border-blue-900/60 text-slate-800 dark:text-slate-100'
                      : 'bg-blue-600 text-white dark:bg-blue-600'
                  }`}
                >
                  {/* Sender title & time */}
                  <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-black/5 dark:border-white/5">
                    <span className={`font-bold ${isAgent ? 'text-blue-700 dark:text-blue-400' : 'text-blue-100'}`}>
                      {msg.senderName}
                    </span>
                    <span className={`font-mono text-[10px] ${isAgent ? 'text-slate-400' : 'text-blue-200'}`}>
                      {msg.createdAt}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </div>

                  {/* Attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-2 space-y-1.5 border-t border-black/5 dark:border-white/5">
                      <p className={`text-[10px] font-bold ${isAgent ? 'text-slate-400' : 'text-blue-200'}`}>
                        Ekli Dosyalar:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                              isAgent
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                : 'bg-blue-700/80 text-white'
                            }`}
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[140px]">{att.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Satisfaction Rating Survey if resolved */}
        {isResolvedOrClosed && (
          <div className="px-6 py-4 bg-emerald-50/70 dark:bg-emerald-950/40 border-t border-emerald-100 dark:border-emerald-900/50 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Bu destek talebi çözümlendi olarak işaretlendi.
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    SportsFly Destek Ekibi hizmet kalitemizi değerlendirmeniz bizim için çok değerlidir.
                  </p>
                </div>
              </div>

              {/* Star Rating selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      onUpdateStatus(ticket.id, ticket.status, {
                        rating: star,
                        comment: ratingComment,
                        submittedAt: new Date().toLocaleDateString('tr-TR'),
                      });
                    }}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (ticket.feedback?.rating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reply Composer Bottom Box */}
        {!isResolvedOrClosed ? (
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c2e] shrink-0 space-y-2.5"
          >
            {/* Quick response helpers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0">Hızlı Yanıt:</span>
              {[
                'Bilgileri kontrol ettim, teşekkürler.',
                'Ekran görüntüsünü ekledim, inceler misiniz?',
                'Sorunumuz çözüldü, elinize sağlık.',
              ].map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(template)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] shrink-0 transition-colors cursor-pointer"
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Attached file badges */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <Paperclip className="w-3 h-3 text-blue-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-xs">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="SportsFly destek ekibine yanıtınızı yazın..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>

              <label
                htmlFor="ticket-reply-file"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                title="Dosya / Ekran görüntüsü ekle"
              >
                <input
                  id="ticket-reply-file"
                  type="file"
                  multiple
                  onChange={handleFileAttach}
                  className="hidden"
                />
                <Paperclip className="w-4 h-4" />
              </label>

              <button
                type="submit"
                disabled={!replyText.trim() && attachments.length === 0}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Yanıtla</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111c2e] flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Bu talep sonuçlandırılmıştır. Yeni bir sorunuz varsa yeni talep açabilir veya bu talebi yeniden aktifleştirebilirsiniz.
            </span>
            <button
              onClick={() => onUpdateStatus(ticket.id, 'Acik')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Talebi Yeniden Aç &amp; Yanıt Yaz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
