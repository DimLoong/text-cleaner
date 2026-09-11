import type { CleanerOptions, Preset } from './types';

export const presets: Record<Exclude<Preset, 'custom'>, CleanerOptions> = {
  basic: {
    trimLines: true,
    collapseSpaces: true,
    collapseBlankLines: true,
    removeDuplicateLines: false,
    normalizePunctuation: false,
    normalizeUnicode: true,
    removeHtml: false,
    removeUrls: false,
    removeEmails: false,
    removeEmoji: false,
  },
  article: {
    trimLines: true,
    collapseSpaces: true,
    collapseBlankLines: true,
    removeDuplicateLines: true,
    normalizePunctuation: true,
    normalizeUnicode: true,
    removeHtml: true,
    removeUrls: false,
    removeEmails: false,
    removeEmoji: false,
  },
  developer: {
    trimLines: true,
    collapseSpaces: false,
    collapseBlankLines: true,
    removeDuplicateLines: false,
    normalizePunctuation: false,
    normalizeUnicode: true,
    removeHtml: false,
    removeUrls: false,
    removeEmails: false,
    removeEmoji: false,
  },
};

export function cleanText(source: string, options: CleanerOptions, find = '', replacement = ''): string {
  let text = source.replace(/\r\n?/g, '\n');

  if (options.normalizeUnicode) text = text.normalize('NFKC');
  if (options.removeHtml) text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '');
  if (options.removeUrls) text = text.replace(/(?:https?:\/\/|www\.)[^\s<]+/gi, '');
  if (options.removeEmails) text = text.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '');
  if (options.removeEmoji) text = text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '');
  if (options.normalizePunctuation) {
    text = text
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/…{2}|\.\.\./g, '…')
      .replace(/[—–]{2,}/g, '—');
  }
  if (options.collapseSpaces) text = text.replace(/[\t\u00A0 ]+/g, ' ');
  if (options.trimLines) text = text.split('\n').map((line) => line.trim()).join('\n');
  if (options.removeDuplicateLines) {
    const seen = new Set<string>();
    text = text.split('\n').filter((line) => {
      if (!line || !seen.has(line)) {
        if (line) seen.add(line);
        return true;
      }
      return false;
    }).join('\n');
  }
  if (options.collapseBlankLines) text = text.replace(/\n{3,}/g, '\n\n');
  if (find) text = text.split(find).join(replacement);

  return text;
}

export function getParagraphs(text: string): string[] {
  return text ? text.split(/\n{2,}/).filter((paragraph) => paragraph.length > 0) : [];
}

/** Split into copyable phrases while keeping every separator and whitespace intact. */
export function getCopySegments(text: string): string[] {
  return text.match(/[\s\S]*?(?:\n+|[。.]+|—+|$)/g)?.filter(Boolean) ?? [];
}

export function getStats(text: string) {
  const trimmed = text.trim();
  const cjk = trimmed.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const latinWords = trimmed.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.filter((word) => !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(word)).length ?? 0;
  return {
    characters: text.length,
    words: cjk + latinWords,
    lines: text ? text.split('\n').length : 0,
    paragraphs: getParagraphs(text).length,
  };
}
