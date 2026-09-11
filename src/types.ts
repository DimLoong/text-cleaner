export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export type Preset = 'basic' | 'article' | 'developer' | 'custom';

export interface CleanerOptions {
  trimLines: boolean;
  collapseSpaces: boolean;
  collapseBlankLines: boolean;
  removeDuplicateLines: boolean;
  normalizePunctuation: boolean;
  normalizeUnicode: boolean;
  removeHtml: boolean;
  removeUrls: boolean;
  removeEmails: boolean;
  removeEmoji: boolean;
}

export interface HistoryEntry {
  id: string;
  source: string;
  createdAt: number;
  preset: Preset;
  options: CleanerOptions;
  find: string;
  replacement: string;
}
