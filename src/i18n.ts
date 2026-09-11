import type { Language } from './types';

const messages = {
  zh: {
    brand: 'CleanText', tagline: '把杂乱文本，变得刚刚好。', subline: '实时清理 · 本地处理 · 随手复制', private: '文本不会离开此设备',
    input: '原始文本', output: '清理结果', placeholder: '在这里粘贴或输入文本…', paste: '粘贴', sample: '试用示例', clear: '清空', undo: '撤销', copyAll: '复制全部', download: '下载', history: '历史记录', hoverSelect: '片段悬浮',
    emptyTitle: '清理后的文本会出现在这里', emptyHint: '输入文本后，所有调整都会实时预览', hoverHint: '悬浮选择片段 · 拖动可多选 · 复制为纯文本', copied: '已复制', copiedAll: '已复制', copyFailed: '复制失败，请手动选择复制', pasteFailed: '无法读取剪贴板，请直接粘贴',
    cleaner: '清理方式', instant: '调整后立即生效', basic: '基础整理', article: '文章排版', developer: '代码友好', custom: '自定义',
    spaces: '空格与段落', chars: '字符处理', privacy: '内容过滤', trimLines: '清除首尾空格', collapseSpaces: '合并连续空格', collapseBlankLines: '收起多余空行', removeDuplicateLines: '移除重复行', normalizePunctuation: '统一弯引号与省略号', normalizeUnicode: '统一全半角字符', removeHtml: '移除 HTML 标签', removeUrls: '移除网址', removeEmails: '移除邮箱', removeEmoji: '移除 Emoji',
    findReplace: '查找与替换', find: '查找内容（纯文本）', replace: '替换为', local: '100% 浏览器本地处理', charsStat: '字符', wordsStat: '字词', linesStat: '行', paragraphsStat: '段', saved: '偏好已自动保存', historySaved: '文本修改会自动保存', noHistory: '还没有历史记录', noHistoryHint: '输入内容并停顿片刻后，这里会出现自动快照', restore: '恢复', restored: '已恢复此版本', deleteRecord: '删除记录', clearHistory: '清空记录', current: '当前',
    sampleText: '  一段需要整理的文字。   它有多余的空格。\n\n\n第二段包含全角字符：ＡＢＣ１２３，以及“弯引号”……\n\n第二段包含全角字符：ＡＢＣ１２３，以及“弯引号”……\n\n访问 https://example.com 或联系 hello@example.com ✨  ',
  },
  en: {
    brand: 'CleanText', tagline: 'Turn messy text into just-right copy.', subline: 'Live cleanup · Local only · One-click copy', private: 'Your text never leaves this device',
    input: 'Original text', output: 'Clean result', placeholder: 'Paste or type your text here…', paste: 'Paste', sample: 'Try sample', clear: 'Clear', undo: 'Undo', copyAll: 'Copy all', download: 'Download', history: 'History', hoverSelect: 'Phrase hover',
    emptyTitle: 'Your cleaned text will appear here', emptyHint: 'Every adjustment previews instantly as you type', hoverHint: 'Hover a phrase · Drag to select · Copies as plain text', copied: 'Copied', copiedAll: 'Copied', copyFailed: 'Copy failed — select and copy manually', pasteFailed: 'Clipboard access failed — paste directly instead',
    cleaner: 'Cleanup recipe', instant: 'Changes apply instantly', basic: 'Quick clean', article: 'Article polish', developer: 'Code friendly', custom: 'Custom',
    spaces: 'Spacing & structure', chars: 'Character cleanup', privacy: 'Content filters', trimLines: 'Trim each line', collapseSpaces: 'Collapse repeated spaces', collapseBlankLines: 'Collapse blank lines', removeDuplicateLines: 'Remove duplicate lines', normalizePunctuation: 'Normalize smart punctuation', normalizeUnicode: 'Normalize full-width text', removeHtml: 'Remove HTML tags', removeUrls: 'Remove URLs', removeEmails: 'Remove email addresses', removeEmoji: 'Remove emoji',
    findReplace: 'Find & replace', find: 'Find text (plain text)', replace: 'Replace with', local: '100% processed in your browser', charsStat: 'Characters', wordsStat: 'Words', linesStat: 'Lines', paragraphsStat: 'Paragraphs', saved: 'Preferences save automatically', historySaved: 'Text changes are saved automatically', noHistory: 'No history yet', noHistoryHint: 'Pause after typing and an automatic snapshot will appear here', restore: 'Restore', restored: 'Version restored', deleteRecord: 'Delete record', clearHistory: 'Clear history', current: 'Current',
    sampleText: '  Here is some messy text.   It has extra spaces.\n\n\nThe second paragraph has “smart quotes” and an ellipsis......\n\nThe second paragraph has “smart quotes” and an ellipsis......\n\nVisit https://example.com or email hello@example.com ✨  ',
  },
} as const;

export type MessageKey = keyof typeof messages.zh;
export const getMessages = (language: Language) => messages[language];
