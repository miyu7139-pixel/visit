import React from 'react';
import { BookOpen, Settings, RefreshCw, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  isConfigured: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  entriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isConfigured,
  isLoading,
  onRefresh,
  onOpenGuide,
  onOpenSettings,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-amber-50/80 border-b border-amber-200/60 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-orange-300 flex items-center justify-center shadow-md shadow-amber-300/40 shrink-0 text-white">
            <FileSpreadsheet className="w-5 h-5 text-amber-950" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 truncate">
                스프레드시트 롤링페이퍼
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                구글 시트 연동
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block truncate">
              구글 시트를 실시간 JSON 데이터베이스로 사용하는 초간단 방명록
            </p>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Badge */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70 shadow-xs'
                : 'bg-amber-100/70 text-amber-800 border-amber-200 hover:bg-amber-200/60 shadow-xs'
            }`}
            title="API 설정 열기"
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{isConfigured ? '구글 시트 연동 중' : '체험 모드 (Demo)'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            <span className="hidden md:inline">새로고침</span>
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs active:scale-95 transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">연동 가이드</span>
            <span className="sm:hidden">가이드</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 text-xs font-medium"
            title="구글 시트 API URL 설정"
          >
            <Settings className="w-4 h-4 text-stone-600" />
            <span className="hidden lg:inline">API 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
