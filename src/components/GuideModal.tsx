import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, AlertTriangle, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../constants/appsScriptTemplate';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'code' | 'faq'>('steps');

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GoogleAppsScript_Guestbook_API.gs';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/80 bg-amber-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-lg font-bold text-stone-900 leading-tight">
                구글 스프레드시트 3분 연동 가이드
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                코딩을 몰라도 괜찮아요! 복사해서 붙여넣기만 하면 실시간 DB가 완성됩니다.
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-stone-100 flex items-center gap-2 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all px-2 ${
              activeTab === 'steps'
                ? 'border-amber-500 text-amber-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. 단계별 연동 방법
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-amber-500 text-amber-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            2. Apps Script 코드 복사
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'border-amber-500 text-amber-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            3. 자주 묻는 질문 (FAQ)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 text-sm">
          {activeTab === 'steps' && (
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-base">
                      새 구글 스프레드시트 열기 (미리 만들 필요 없음!)
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      자동 헤더 생성 지원
                    </span>
                  </div>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    구글 드라이브에서 새 스프레드시트를 만들고 <b>아무것도 입력하지 않은 빈 상태</b>로 두셔도 됩니다. 스크립트가 첫 글 등록 시 자동으로 아래와 같이 1행 헤더와 서식을 예쁘게 세팅해 줍니다!
                  </p>

                  {/* Visual Table Preview */}
                  <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs text-[11px] font-mono">
                    <div className="grid grid-cols-7 bg-amber-100/80 border-b border-stone-200 text-stone-900 font-bold text-center py-1.5 divide-x divide-stone-200">
                      <div>A: ID</div>
                      <div>B: 작성일시</div>
                      <div>C: 작성자</div>
                      <div>D: 응원메시지</div>
                      <div>E: 이모지</div>
                      <div>F: 카드색상</div>
                      <div>G: 좋아요</div>
                    </div>
                    <div className="grid grid-cols-7 text-stone-500 text-center py-1.5 divide-x divide-stone-100 bg-stone-50/50">
                      <div className="truncate px-1">entry_174...</div>
                      <div className="truncate px-1">2026-09-30...</div>
                      <div className="truncate px-1">민우</div>
                      <div className="truncate px-1">화이팅!</div>
                      <div>💖</div>
                      <div>yellow</div>
                      <div>0</div>
                    </div>
                  </div>

                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline pt-1"
                  >
                    sheets.new 바로가기 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 text-base">
                    Apps Script 편집기 열기
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    상단 메뉴에서 <span className="font-semibold text-stone-900 bg-amber-100/80 px-1.5 py-0.5 rounded-sm">[확장 프로그램]</span> →{' '}
                    <span className="font-semibold text-stone-900 bg-amber-100/80 px-1.5 py-0.5 rounded-sm">[Apps Script]</span>를 클릭합니다.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-base">
                      제공된 코드 붙여넣고 저장
                    </h4>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? '복사 완료!' : '코드 원클릭 복사'}</span>
                    </button>
                  </div>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    기존 편집기에 적힌 내용을 모두 지우고, [코드 복사]를 눌러 전체를 붙여넣은 뒤{' '}
                    <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-xs font-mono font-bold">Ctrl+S</kbd>(Mac: <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-xs font-mono font-bold">⌘+S</kbd>)로 저장합니다.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-300">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  4
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-base">
                      웹 앱으로 배포하기 (가장 중요 ⭐)
                    </h4>
                  </div>
                  <ol className="text-stone-700 text-xs sm:text-sm space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>우측 상단 파란색 <b>[배포]</b> 버튼 → <b>[새 배포]</b> 클릭</li>
                    <li>왼쪽 톱니바퀴 ⚙️ 아이콘 클릭 → <b>[웹 앱]</b> 선택</li>
                    <li>설명: <b>방명록 API</b> 입력</li>
                    <li>실행할 사용자: <b>나 (내 계정)</b> 선택</li>
                    <li>
                      <b className="text-rose-600 bg-rose-100 px-1 py-0.5 rounded">
                        액세스 권한: 모든 사용자 (Anyone)
                      </b>{' '}
                      로 반드시 선택해야 방문자가 글을 작성할 수 있습니다!
                    </li>
                  </ol>

                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      첫 배포 시 <b>'액세스 승인'</b> 팝업이 뜰 수 있습니다. [고급] → [프로젝트명(안전하지 않음)으로 이동] → [허용]을 누르시면 됩니다. (본인의 구글 시트에 접근하는 것이므로 안전합니다)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center shrink-0 text-sm">
                  5
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-base">
                    생성된 웹 앱 URL 등록
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    배포 완료 후 나타난 <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-800 text-xs font-mono">https://script.google.com/macros/s/.../exec</code> 링크를 복사하여 아래 [API 설정에 등록하기]를 눌러 붙여넣으면 즉시 연동 완료!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs"
                  >
                    <span>지금 바로 웹 앱 URL 등록하기 🚀</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl">
                <div className="text-xs text-stone-600">
                  <span className="font-semibold text-stone-900">Apps Script 소스코드</span> (doGet, doPost, 자동 헤더 생성, 좋아요 기능 포함)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.gs 다운로드</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사 완료!' : '전체 코드 복사'}</span>
                  </button>
                </div>
              </div>

              {/* Code display block */}
              <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner leading-relaxed select-all">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                  <span className="text-amber-600">Q.</span>
                  방문자가 글을 쓸 때 구글 로그인이 필요한가요?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  아닙니다! 배포 시 <b>'액세스 권한: 모든 사용자 (Anyone)'</b>로 설정하면, 사이트 방문자는 구글 로그인 없이 익명으로도 자유롭게 응원글을 남길 수 있습니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                  <span className="text-amber-600">Q.</span>
                  글이 등록되는 스프레드시트의 컬럼 구성은 어떻게 되나요?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  스크립트가 첫 실행 시 <b>'방명록'</b> 시트를 자동 생성하고, 1행에 <code>[ID, 작성일시, 작성자, 응원메시지, 이모지, 카드색상, 좋아요]</code> 헤더를 예쁘게 만들어줍니다. 수동으로 열을 만드실 필요가 없습니다!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                  <span className="text-amber-600">Q.</span>
                  코드를 수정한 뒤에는 어떻게 해야 하나요?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Apps Script 코드를 수정한 후에는 반드시 <b>[배포] → [배포 관리] → 연필 아이콘 ✏️ 클릭 → 버전: [새 버전] 선택 후 저장</b>해야 수정된 코드가 즉시 반영됩니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                  <span className="text-amber-600">Q.</span>
                  비용이 드나요?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  구글 스프레드시트와 Apps Script는 완전 <b>100% 무료</b>입니다! 별도의 서버나 유료 데이터베이스 호스팅 없이도 수만 건의 방명록을 무료로 안전하게 운영할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200/80 bg-stone-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>개인정보 안전 (구글 서버 직접 통신)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium text-xs transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs"
            >
              API URL 설정하러 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
