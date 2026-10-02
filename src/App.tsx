import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Heart,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  MessageSquareHeart,
  TrendingUp,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { GuestbookEntry, ToastInfo } from './types';
import {
  getStoredApiUrl,
  saveApiUrl,
  fetchEntriesFromSheet,
  postEntryToSheet,
  likeEntryInSheet,
  getLocalDemoEntries,
  saveLocalDemoEntries,
} from './services/googleSheetService';
import { INITIAL_DEMO_ENTRIES } from './constants/appsScriptTemplate';
import { Header } from './components/Header';
import { EntryForm } from './components/EntryForm';
import { EntryCard } from './components/EntryCard';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

export default function App() {
  const [apiUrl, setApiUrl] = useState<string>(() => getStoredApiUrl());
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterEmoji, setSelectedFilterEmoji] = useState('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');

  // Modals & feedback
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch entries
  const loadEntries = useCallback(async (url: string = apiUrl) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchEntriesFromSheet(url);
      setEntries(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || '데이터를 불러오지 못했습니다. 스프레드시트 배포 권한이나 URL을 확인해주세요.'
      );
      // Fallback to local entries so UI isn't completely empty
      setEntries(getLocalDemoEntries());
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    loadEntries(apiUrl);
  }, [apiUrl, loadEntries]);

  // Handle new entry submission
  const handleSubmitEntry = async (data: {
    name: string;
    message: string;
    emoji: string;
    color: string;
  }): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const created = await postEntryToSheet(apiUrl, data);
      setEntries((prev) => [created, ...prev]);

      if (apiUrl) {
        addToast('🎉 응원 메시지가 구글 스프레드시트에 안전하게 저장되었습니다!', 'success');
      } else {
        addToast('🎉 응원 메시지가 등록되었습니다! (체험 모드에 저장됨)', 'success');
      }
      return true;
    } catch (err: any) {
      console.error(err);
      addToast(err.message || '등록에 실패했습니다. API 설정을 확인해주세요.', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like button
  const handleLike = async (id: string, currentLikes: number) => {
    // Optimistic UI update
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item))
    );

    try {
      await likeEntryInSheet(apiUrl, id, currentLikes);
    } catch (err) {
      console.warn('Like request failed, updated locally only.', err);
    }
  };

  // Handle save new API URL
  const handleSaveApiUrl = (newUrl: string) => {
    setApiUrl(newUrl);
    saveApiUrl(newUrl);
    loadEntries(newUrl);
    if (newUrl) {
      addToast('구글 Apps Script API URL이 저장되었습니다!', 'success');
    } else {
      addToast('체험 모드로 전환되었습니다.', 'info');
    }
  };

  // Reset demo data
  const handleResetDemoData = () => {
    saveLocalDemoEntries(INITIAL_DEMO_ENTRIES);
    setEntries(INITIAL_DEMO_ENTRIES);
    addToast('체험용 샘플 데이터가 재설정되었습니다.', 'info');
  };

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Emoji filter
        if (selectedFilterEmoji !== 'ALL' && entry.emoji !== selectedFilterEmoji) {
          return false;
        }

        // Search query filter (matches name or message)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = entry.name?.toLowerCase().includes(query);
          const matchMsg = entry.message?.toLowerCase().includes(query);
          return matchName || matchMsg;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        // default: latest (by timestamp or order)
        return (new Date(b.timestamp).getTime() || 0) - (new Date(a.timestamp).getTime() || 0);
      });
  }, [entries, selectedFilterEmoji, searchQuery, sortBy]);

  // Aggregate stats
  const totalLikes = useMemo(
    () => entries.reduce((acc, cur) => acc + (cur.likes || 0), 0),
    [entries]
  );

  const availableEmojis = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.emoji) set.add(e.emoji);
    });
    return Array.from(set);
  }, [entries]);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-800">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header Bar */}
      <Header
        isConfigured={Boolean(apiUrl.trim())}
        isLoading={isLoading}
        onRefresh={() => loadEntries()}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        entriesCount={entries.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Alert if Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">구글 시트 연동 주의사항</p>
                <p className="text-xs text-rose-700 leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/60 text-xs font-semibold"
              >
                연동 가이드 보기
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
              >
                API URL 변경
              </button>
            </div>
          </div>
        )}

        {/* Hero Notice if Demo Mode */}
        {!apiUrl.trim() && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-100/90 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-200/90 text-amber-900 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  현재 <span className="text-amber-800 underline decoration-amber-400">체험 모드</span>로 작동 중입니다!
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-0.5">
                  나만의 구글 스프레드시트와 실시간으로 연동하여 진짜 웹 방명록 데이터베이스를 만들어보세요.
                  복사해서 붙여넣기만 하면 3분 만에 무료로 배포할 수 있습니다!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>3분 연동 가이드 & 코드</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Section: Write Form & Stats summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Write Cheer Form */}
          <div className="lg:col-span-7">
            <EntryForm
              onSubmit={handleSubmitEntry}
              isSubmitting={isSubmitting}
              isConfigured={Boolean(apiUrl.trim())}
            />
          </div>

          {/* Side Info & Live Stats */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Stats Card */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  실시간 방명록 현황
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {apiUrl ? '구글 시트 연동' : '로컬 체험 모드'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
                    <MessageSquareHeart className="w-4 h-4 text-amber-600" />
                    <span>남겨진 응원</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {entries.length}
                    <span className="text-xs font-medium text-stone-500 ml-1">개</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 mb-1">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>보낸 하트</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {totalLikes}
                    <span className="text-xs font-medium text-stone-500 ml-1">개</span>
                  </div>
                </div>
              </div>

              {/* Quick Tech Stack badge list */}
              <div className="pt-2 text-xs text-stone-500 space-y-2">
                <p className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  구글 시트 데이터베이스의 장점
                </p>
                <ul className="space-y-1 text-[12px] text-stone-600 list-disc list-inside">
                  <li>무료 클라우드 데이터베이스 (서버 비용 0원)</li>
                  <li>스프레드시트에서 실시간 엑셀처럼 글 확인 및 수정 가능</li>
                  <li>구글의 안전한 보안 인프라로 자동 백업</li>
                </ul>
              </div>
            </div>

            {/* Quick Link to open Google Sheets */}
            <div className="p-4 rounded-2xl bg-amber-100/40 border border-amber-200 flex items-center justify-between text-xs">
              <span className="text-stone-700 font-medium">스프레드시트를 새로 만들고 싶으신가요?</span>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline"
              >
                <span>sheets.new 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Board Section: Filter, Search & Cards */}
        <section className="space-y-6 pt-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작성자 이름 또는 메시지 내용 검색..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:ring-2 focus:ring-amber-400 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Right Controls: Sort & Refresh */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sort selector */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    sortBy === 'latest'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('likes')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    sortBy === 'likes'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>인기순</span>
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={() => loadEntries()}
                disabled={isLoading}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="목록 새로고침"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Emoji Sticker Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-stone-500 font-semibold shrink-0 flex items-center gap-1 pl-1">
              <Filter className="w-3.5 h-3.5" />
              <span>필터:</span>
            </span>
            <button
              onClick={() => setSelectedFilterEmoji('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 ${
                selectedFilterEmoji === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              전체 보기 ({entries.length})
            </button>
            {['💖', '🍀', '🎉', '🔥', '☕', '✨', '🌸', '💪'].map((emoji) => {
              const count = entries.filter((e) => e.emoji === emoji).length;
              if (count === 0 && selectedFilterEmoji !== emoji) return null;
              return (
                <button
                  key={emoji}
                  onClick={() => setSelectedFilterEmoji(emoji)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                    selectedFilterEmoji === emoji
                      ? 'bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-xs scale-105'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] font-semibold text-stone-500">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-sm font-medium">스프레드시트에서 글 목록을 불러오는 중...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredEntries.length === 0 && (
            <div className="py-16 px-4 rounded-3xl bg-white border border-stone-200/80 text-center space-y-3">
              <div className="text-4xl">💌</div>
              <h3 className="font-bold text-stone-900 text-base">아직 등록된 응원 글이 없습니다</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? '검색어와 일치하는 응원 글을 찾을 수 없습니다. 다른 검색어를 입력해보세요.'
                  : '첫 번째 응원 메시지의 주인공이 되어보세요! 위 입력창에서 한마디를 적어보세요.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilterEmoji('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-semibold text-xs hover:bg-amber-200 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
          )}

          {/* Cards Grid */}
          {!isLoading && filteredEntries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onLike={handleLike} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-amber-200/60 bg-amber-50/60 py-8 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets & Apps Script JSON API 방명록</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
            >
              연동 가이드
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
            >
              API URL 설정
            </button>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveUrl={handleSaveApiUrl}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
