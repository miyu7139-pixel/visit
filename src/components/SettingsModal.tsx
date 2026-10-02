import React, { useState, useEffect } from 'react';
import { X, Check, Globe, RefreshCcw, Loader2, Sparkles, BookOpen, AlertCircle, Trash2 } from 'lucide-react';
import { testSheetConnection } from '../services/googleSheetService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveUrl: (newUrl: string) => void;
  onOpenGuide: () => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveUrl,
  onOpenGuide,
  onResetDemoData,
}) => {
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setInputUrl(apiUrl);
    setTestResult(null);
  }, [apiUrl, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({
        success: false,
        message: '테스트할 웹 앱 URL을 먼저 입력해주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSheetConnection(inputUrl.trim());
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    onSaveUrl(inputUrl.trim());
    onClose();
  };

  const handleSwitchToDemo = () => {
    setInputUrl('');
    onSaveUrl('');
    setTestResult({
      success: true,
      message: '체험 모드로 전환되었습니다. 브라우저 로컬 저장소를 사용합니다.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/80 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Globe className="w-5 h-5 text-amber-800" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                구글 시트 API 연동 설정
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Apps Script 배포 URL을 입력하여 실시간 연동을 시작하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                구글 Apps Script 웹 앱 URL
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>URL 생성 방법 보기</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 placeholder:text-stone-400 font-mono text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden resize-none"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              * 비워둘 경우 내 컴퓨터(브라우저)에서 바로 테스트할 수 있는 <b>체험 모드(Demo)</b>로 동작합니다.
            </p>
          </div>

          {/* Test connection button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !inputUrl.trim()}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>연결 확인 중...</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="w-3.5 h-3.5 text-stone-600" />
                  <span>연결 테스트</span>
                </>
              )}
            </button>

            {inputUrl && (
              <button
                type="button"
                onClick={handleSwitchToDemo}
                className="px-3 py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors"
              >
                체험 모드로 전환
              </button>
            )}
          </div>

          {/* Test Result Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{testResult.message}</div>
            </div>
          )}

          {/* Demo Reset Action */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>체험용 샘플 데이터 초기화:</span>
            <button
              type="button"
              onClick={() => {
                onResetDemoData();
                setTestResult({
                  success: true,
                  message: '체험용 데이터가 초기 상태로 재설정되었습니다.',
                });
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>샘플 글 초기화</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-xs transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
