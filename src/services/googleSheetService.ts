import { GuestbookEntry } from '../types';
import { INITIAL_DEMO_ENTRIES } from '../constants/appsScriptTemplate';

const LOCAL_STORAGE_KEY = 'gsheet_guestbook_entries_demo';
const SAVED_URL_KEY = 'gsheet_guestbook_api_url';

export function getStoredApiUrl(): string {
  try {
    return localStorage.getItem(SAVED_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function saveApiUrl(url: string): void {
  try {
    localStorage.setItem(SAVED_URL_KEY, url.trim());
  } catch (e) {
    console.error('Failed to save API URL to localStorage', e);
  }
}

export function getLocalDemoEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not parse demo entries', e);
  }
  return INITIAL_DEMO_ENTRIES;
}

export function saveLocalDemoEntries(entries: GuestbookEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save demo entries', e);
  }
}

/**
 * Fetch guestbook entries from Google Apps Script Web App API
 */
export async function fetchEntriesFromSheet(apiUrl: string): Promise<GuestbookEntry[]> {
  const trimmedUrl = apiUrl.trim();

  // If no URL configured, return local demo entries
  if (!trimmedUrl) {
    return getLocalDemoEntries();
  }

  try {
    const separator = trimmedUrl.includes('?') ? '&' : '?';
    const timestampQuery = `${separator}t=${Date.now()}`;
    const response = await fetch(`${trimmedUrl}${timestampQuery}`, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.status === 'error') {
      throw new Error(json.message || '스프레드시트에서 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    if (Array.isArray(json.data)) {
      return json.data;
    } else if (Array.isArray(json)) {
      return json;
    }

    return [];
  } catch (err: any) {
    console.error('Failed to fetch from Google Sheet:', err);
    throw new Error(
      err.message || '구글 시트 웹앱과의 연결에 실패했습니다. Apps Script 배포 URL 및 접근 권한(모든 사용자)을 확인해주세요.'
    );
  }
}

/**
 * Submit a new guestbook entry to Google Apps Script Web App
 */
export async function postEntryToSheet(
  apiUrl: string,
  newEntry: { name: string; message: string; emoji: string; color: string }
): Promise<GuestbookEntry> {
  const trimmedUrl = apiUrl.trim();

  // Demo fallback
  if (!trimmedUrl) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const created: GuestbookEntry = {
      id: `demo_${Date.now()}`,
      timestamp: formattedDate,
      name: newEntry.name || '익명',
      message: newEntry.message,
      emoji: newEntry.emoji,
      color: newEntry.color,
      likes: 0,
    };

    const current = getLocalDemoEntries();
    const updated = [created, ...current];
    saveLocalDemoEntries(updated);
    return created;
  }

  try {
    // Note: We use 'text/plain;charset=utf-8' to avoid CORS preflight (OPTIONS)
    // which Google Apps Script Web Apps do not handle well.
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(newEntry),
    });

    if (!response.ok) {
      throw new Error(`저장 실패 (${response.status})`);
    }

    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message || '구글 시트 저장 실패');
    }

    if (result.data) {
      return result.data;
    }

    // Fallback constructed entry if response doesn't return data object
    return {
      id: `entry_${Date.now()}`,
      timestamp: new Date().toLocaleString('ko-KR'),
      name: newEntry.name,
      message: newEntry.message,
      emoji: newEntry.emoji,
      color: newEntry.color,
      likes: 0,
    };
  } catch (err: any) {
    console.error('Failed to post entry to Google Sheet:', err);
    throw new Error(
      err.message || '구글 시트에 글을 등록하지 못했습니다. 웹앱 URL 및 Apps Script 설정을 다시 점검해주세요.'
    );
  }
}

/**
 * Increment like counter for an entry
 */
export async function likeEntryInSheet(apiUrl: string, entryId: string, currentLikes: number): Promise<number> {
  const trimmedUrl = apiUrl.trim();

  // Demo fallback
  if (!trimmedUrl) {
    const list = getLocalDemoEntries();
    const updated = list.map((item) => (item.id === entryId ? { ...item, likes: (item.likes || 0) + 1 } : item));
    saveLocalDemoEntries(updated);
    return currentLikes + 1;
  }

  try {
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'like', id: entryId }),
    });

    if (response.ok) {
      const res = await response.json();
      if (res.likes !== undefined) {
        return res.likes;
      }
    }
    return currentLikes + 1;
  } catch (err) {
    console.warn('Like request fallback:', err);
    return currentLikes + 1;
  }
}

/**
 * Test if the Apps Script URL is reachable
 */
export async function testSheetConnection(url: string): Promise<{ success: boolean; message: string; count?: number }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { success: false, message: 'URL을 입력해주세요.' };
  }
  if (!trimmed.startsWith('https://script.google.com/')) {
    return { success: false, message: '구글 Apps Script 웹앱 URL은 https://script.google.com/ 으로 시작해야 합니다.' };
  }

  try {
    const separator = trimmed.includes('?') ? '&' : '?';
    const testUrl = `${trimmed}${separator}t=${Date.now()}`;
    const res = await fetch(testUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `HTTP 응답 오류: ${res.status}. 배포 권한이 '모든 사용자(Anyone)'로 되어 있는지 확인해주세요.`,
      };
    }

    const data = await res.json();
    if (data.status === 'success') {
      const count = Array.isArray(data.data) ? data.data.length : 0;
      return {
        success: true,
        message: `연결 성공! 현재 시트에 저장된 글: ${count}개`,
        count,
      };
    } else {
      return {
        success: false,
        message: data.message || '시트 응답에서 오류가 반환되었습니다.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `연결 실패: ${err.message || '네트워크 오류가 발생했습니다. URL이 올바른지 확인해주세요.'}`,
    };
  }
}
