import React, { useState } from 'react';
import { Heart, Copy, Check, Clock, User } from 'lucide-react';
import { GuestbookEntry } from '../types';
import { COLOR_THEMES } from '../constants/appsScriptTemplate';

interface EntryCardProps {
  entry: GuestbookEntry;
  onLike: (id: string, currentLikes: number) => Promise<void>;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onLike }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const theme = COLOR_THEMES.find((c) => c.id === entry.color) || COLOR_THEMES[0];

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setHasLiked(true);
    try {
      await onLike(entry.id, entry.likes || 0);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${entry.name}: "${entry.message}"`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  };

  // Format timestamp nicely
  const formattedTime = (() => {
    if (!entry.timestamp) return '';
    try {
      const date = new Date(entry.timestamp);
      if (isNaN(date.getTime())) {
        return entry.timestamp; // return raw string if already formatted e.g. "2026-09-30 22:30:15"
      }
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return entry.timestamp;
    }
  })();

  return (
    <div
      className={`group relative rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md border transition-all duration-200 flex flex-col justify-between ${theme.bgClass} ${theme.borderClass}`}
    >
      {/* Top Corner Tape / Pin decoration */}
      <div className="absolute -top-2.5 right-6 w-14 h-5 bg-white/70 border border-stone-200/50 rounded-xs rotate-[2deg] shadow-2xs pointer-events-none backdrop-blur-2xs" />

      <div>
        {/* Card Header: Emoji + Author + Timestamp */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-xs select-none">
              {entry.emoji || '💖'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 text-sm sm:text-base truncate">
                  {entry.name || '익명'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-stone-500 hover:text-stone-800 transition-all opacity-80 group-hover:opacity-100 shadow-2xs"
            title="메시지 복사"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Message Content */}
        <p className="text-stone-800 text-sm sm:text-base leading-relaxed break-words font-medium whitespace-pre-line py-1">
          {entry.message}
        </p>
      </div>

      {/* Card Footer: Likes & Action */}
      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          {theme.name}
        </div>

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
            hasLiked
              ? 'bg-rose-500 text-white shadow-rose-200'
              : 'bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600'
          }`}
          title="응원 하트 보내기"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              hasLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
            } ${isLiking ? 'animate-ping' : ''}`}
          />
          <span>{entry.likes || 0}</span>
        </button>
      </div>
    </div>
  );
};
