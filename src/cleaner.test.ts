import { describe, expect, it } from 'vitest';
import { cleanText, getCopySegments, getStats, presets } from './cleaner';

describe('cleanText', () => {
  it('normalizes common whitespace without flattening paragraphs', () => {
    expect(cleanText('  hello   world  \n\n\n  next  ', presets.basic)).toBe('hello world\n\nnext');
  });

  it('applies article cleanup and removes duplicate lines', () => {
    expect(cleanText('<b>ＡＢＣ</b>\nＡＢＣ', presets.article)).toBe('ABC');
  });

  it('uses literal find and replace', () => {
    expect(cleanText('a.b a.b', presets.basic, 'a.b', 'ok')).toBe('ok ok');
  });
});

describe('getStats', () => {
  it('counts CJK characters and latin words', () => {
    expect(getStats('你好 clean text').words).toBe(4);
  });
});

describe('getCopySegments', () => {
  it('splits on line breaks, periods, and em dashes without losing text', () => {
    const text = '第一句。第二句——补充\nNext. Done';
    const segments = getCopySegments(text);
    expect(segments).toEqual(['第一句。', '第二句——', '补充\n', 'Next.', ' Done']);
    expect(segments.join('')).toBe(text);
  });
});
