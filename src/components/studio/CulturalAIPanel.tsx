import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Wand2, 
  ArrowRight, 
  Check, 
  Lightbulb, 
  BookOpen,
  Send,
  Loader2
} from 'lucide-react';
import { EtiquetteAuditResult, GarmentLayerState } from '../../types';

interface CulturalAIPanelProps {
  auditResult: EtiquetteAuditResult;
  onAutoFix: () => void;
  onAskAiStylist: (prompt: string) => Promise<void>;
  isAiLoading: boolean;
  aiRecommendation: any | null;
  onApplyAiRecommendation: () => void;
}

export const CulturalAIPanel: React.FC<CulturalAIPanelProps> = ({
  auditResult,
  onAutoFix,
  onAskAiStylist,
  isAiLoading,
  aiRecommendation,
  onApplyAiRecommendation
}) => {
  const [isAdviceExpanded, setIsAdviceExpanded] = useState(true);
  const [promptInput, setPromptInput] = useState('');

  const quickPromptTags = [
    { label: '✨ Kỷ yếu Văn Miếu', text: 'Chụp ảnh kỷ yếu tốt nghiệp tại Văn Miếu Quốc Tử Giám' },
    { label: '☕ Dạo phố Gen Z', text: 'Phối phong cách dạo phố cà phê trẻ trung năng động' },
    { label: '🏮 Tết Nguyên Đán', text: 'Chúc Tết truyền thống du xuân thanh lịch' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim() && !isAiLoading) {
      onAskAiStylist(promptInput.trim());
    }
  };

  const handleQuickTagClick = (text: string) => {
    setPromptInput(text);
    onAskAiStylist(text);
  };

  const score = auditResult.score || 0;
  const isZeroState = score === 0 || (auditResult.issues.length === 1 && auditResult.issues[0].code === 'ZERO_STATE');
  const isPerfect = score === 100 && auditResult.issues.length === 0;

  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.stopPropagation();
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <aside className="w-[300px] shrink-0 bg-[#141414] border-l border-stone-800/80 flex flex-col h-[calc(100vh-3.5rem)] text-stone-200 select-none overflow-y-auto p-3.5 space-y-3.5 z-20 no-scrollbar touch-pan-y">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-800/60">
        <span className="text-xs font-semibold tracking-wider uppercase font-serif text-[#FAF9F5] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          AI 
        </span>
        <span className="text-[10px] text-stone-500 font-mono">Ver 0.1.0</span>
      </div>

      {/* CARD 1: HERITAGE GUARDRAIL */}
      <div className="bg-[#181818] border border-stone-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        {/* Score & Badge Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Circular Progress Gauge */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-stone-800"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={100}
                  strokeDashoffset={100 - score}
                  strokeLinecap="round"
                  className={isPerfect ? 'text-emerald-500' : 'text-amber-500'}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-bold font-mono text-stone-200">
                {score}
              </span>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-stone-100 flex items-center gap-1 font-serif">
                {isZeroState ? 'Chưa Phối Trang Phục' : isPerfect ? 'Chuẩn Mực Lễ Nghi' : 'Lưu Ý Điển Tích'}
              </h2>
              <p className="text-[10px] text-stone-400">
                {isZeroState ? '0/100 - Chưa phối trang phục' : isPerfect ? '100/100 Lễ Nghi Cổ Phong' : `${score}/100 Cần hiệu chỉnh`}
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isZeroState
              ? 'bg-stone-900 border-stone-700 text-stone-400'
              : isPerfect 
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' 
                : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
          }`}>
            {isZeroState ? 'Chờ phối đồ' : isPerfect ? 'Hoàn hảo' : 'Có lưu ý'}
          </span>
        </div>

        {/* Single Expandable Banner for Cultural Advice */}
        <div className="border border-stone-800/80 rounded-xl overflow-hidden bg-[#1c1c1c]">
          <button
            type="button"
            onClick={() => setIsAdviceExpanded(!isAdviceExpanded)}
            className="w-full p-2.5 flex items-center justify-between text-left text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800/50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 truncate text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">Quy chuẩn</span>
            </span>
            {isAdviceExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            )}
          </button>

          {isAdviceExpanded && (
            <div className="p-3 border-t border-stone-800/80 text-[11px] text-stone-400 space-y-2 leading-relaxed">
              <p>{auditResult.guidance}</p>

              {auditResult.issues.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {auditResult.issues.map((iss, i) => (
                    <div key={i} className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300/90">
                      <p className="font-semibold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        {iss.title}
                      </p>
                      <p className="text-[10px] text-stone-300 mt-0.5">{iss.description}</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={onAutoFix}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#8B0000] hover:bg-[#A00000] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Chuẩn hóa</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CARD 2: AI STYLIST */}
      <div className="bg-[#181818] border border-stone-800 rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <h2 className="text-xs font-semibold text-stone-100 font-serif">
              Trợ Lý AI
            </h2>
          </div>
        </div>

        {/* Minimalist Input Box with Integrated Sparkle Icon */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Hỏi AI Stylist (vd: Kỷ yếu Văn Miếu)..."
            disabled={isAiLoading}
            className="w-full bg-[#1c1c1c] border border-stone-700/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl pl-3 pr-9 py-2 text-xs text-stone-200 placeholder-stone-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!promptInput.trim() || isAiLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-[#D4AF37] disabled:opacity-30 disabled:hover:text-stone-400 cursor-pointer transition-colors"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* 3 Compact Horizontally Scrollable Tag Pills */}
        <div 
          onWheel={handleHorizontalWheel}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x snap-x scroll-smooth pb-1"
        >
          {quickPromptTags.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickTagClick(tag.text)}
              disabled={isAiLoading}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#1e1e1e] hover:bg-[#282828] text-stone-400 hover:text-stone-200 border border-stone-800 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* AI Recommendation Result Card */}
        {aiRecommendation && (
          <div className="bg-[#1c1c1c] border border-stone-700/60 rounded-xl p-3 space-y-2.5 text-xs text-stone-300 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                Gợi ý
              </span>
              <h4 className="font-semibold text-white mt-0.5 font-serif">
                {aiRecommendation.outfitTitle || 'Phong Cách Phối Khuyên Dùng'}
              </h4>
              <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                {aiRecommendation.concept}
              </p>
            </div>

            {/* Colors Preview */}
            {aiRecommendation.colorPalette && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-stone-400">Màu:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    aiRecommendation.colorPalette.primary,
                    aiRecommendation.colorPalette.secondary,
                    aiRecommendation.colorPalette.accent
                  ].filter(Boolean).map((hex, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Tip */}
            {aiRecommendation.etiquetteNotes && (
              <div className="bg-[#181818] p-2 rounded-lg text-[10px] text-stone-400 border border-stone-800">
                <span className="font-semibold text-stone-300">Điểm sáng: </span>
                {aiRecommendation.etiquetteNotes}
              </div>
            )}

            {/* 1-Click Apply */}
            <button
              type="button"
              onClick={onApplyAiRecommendation}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#C0392B] hover:from-[#A00000] hover:to-[#D93829] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Áp Dụng</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
