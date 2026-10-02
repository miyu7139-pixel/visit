import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Smile, Palette, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLOR_THEMES, EMOJI_OPTIONS } from '../constants/appsScriptTemplate';

interface EntryFormProps {
  onSubmit: (data: { name: string; message: string; emoji: string; color: string }) => Promise<boolean>;
  isSubmitting: boolean;
  isConfigured: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, isSubmitting, isConfigured }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [errorMsg, setErrorMsg] = useState('');

  const activeColorTheme = COLOR_THEMES.find((c) => c.id === selectedColor) || COLOR_THEMES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('따뜻한 응원 한마디를 적어주세요! 😊');
      return;
    }
    setErrorMsg('');

    const success = await onSubmit({
      name: name.trim() || '익명의 친구',
      message: message.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
    });

    if (success) {
      setMessage('');
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6'],
        });
      } catch (err) {
        // Ignore if blocked in some environments
      }
    }
  };

  return (
    <div className="relative">
      {/* Decorative Washi Tape atop the card */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-200/70 border border-amber-300/60 rounded-xs rotate-[-1.5deg] shadow-xs z-10 pointer-events-none backdrop-blur-xs flex items-center justify-center">
        <span className="text-[10px] tracking-widest text-amber-800/80 font-bold uppercase select-none">
          ROLLING PAPER
        </span>
      </div>

      <div
        className={`relative rounded-3xl p-6 sm:p-7 shadow-lg border transition-all duration-300 ${activeColorTheme.bgClass} ${activeColorTheme.borderClass}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="sticker">
              {selectedEmoji}
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                응원 한마디 남기기
                <Sparkles className="w-4 h-4 text-amber-600 inline" />
              </h2>
              <p className="text-xs text-stone-600">
                {isConfigured ? '구글 스프레드시트에 즉시 기록됩니다' : '체험 모드: 로컬 브라우저에 즉시 저장됩니다'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-stone-500 bg-white/70 px-2.5 py-1 rounded-full border border-stone-200/50">
              {message.length} / 300자
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Author Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              작성자 이름 / 닉네임 <span className="text-stone-400 font-normal">(미입력 시 '익명의 친구')</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 민지, 도쿄 여행자, 익명의 요정"
              maxLength={30}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              응원 메시지 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="오늘 하루도 수고 많았어요! 좋은 일만 가득하기를 응원합니다 🍀"
              rows={3}
              maxLength={300}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-white/90 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-2xs resize-none"
            />
            {errorMsg && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}
          </div>

          {/* Emoji & Sticker Picker */}
          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-stone-600" />
              <span>스티커 선택</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(item.emoji)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? 'bg-white shadow-sm border-amber-400 font-bold scale-105 ring-1 ring-amber-400 text-stone-900'
                        : 'bg-white/60 hover:bg-white/90 border-stone-200/60 text-stone-700'
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[11px] hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Color Theme Picker */}
          <div className="pt-1">
            <label className="text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-stone-600" />
              <span>메모지 색상</span>
            </label>
            <div className="flex items-center gap-2">
              {COLOR_THEMES.map((theme) => {
                const isSelected = selectedColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedColor(theme.id)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${theme.dotClass} ${
                      isSelected
                        ? 'border-stone-800 scale-110 shadow-md ring-2 ring-white'
                        : 'border-white/80 hover:scale-105 shadow-xs'
                    }`}
                    title={theme.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-stone-900 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-sm tracking-wide shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                  <span>구글 시트에 등록하는 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-950" />
                  <span>응원 메시지 등록하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
