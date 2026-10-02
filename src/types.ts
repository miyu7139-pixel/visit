export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  emoji: string;
  color: string;
  likes: number;
}

export type ColorTheme = {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  accentClass: string;
};

export interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
