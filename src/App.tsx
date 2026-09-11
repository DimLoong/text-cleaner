import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Drawer, Input, Message, MessagePlugin, Switch, Tag, Textarea, Tooltip } from 'tdesign-react';
import {
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  FileRestoreIcon,
  HistoryIcon,
  MoonIcon,
  PasteIcon,
  RollbackIcon,
  SunnyIcon,
  TranslateIcon,
} from 'tdesign-icons-react';
import { cleanText, getCopySegments, getStats, presets } from './cleaner';
import { getMessages } from './i18n';
import type { CleanerOptions, HistoryEntry, Language, Preset, Theme } from './types';

const STORAGE_KEY = 'cleantext-preferences-v1';
const HISTORY_KEY = 'cleantext-history-v1';
const DRAFT_KEY = 'cleantext-draft-v1';
const MAX_HISTORY = 30;

function getStoredPreferences(): { language?: Language; theme?: Theme; preset?: Preset; options?: Partial<CleanerOptions>; hoverSelect?: boolean } {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}

function getStoredDraft(): { source?: string; find?: string; replacement?: string } {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); }
  catch { return {}; }
}

const optionGroups: Array<{ title: 'spaces' | 'chars' | 'privacy'; keys: Array<keyof CleanerOptions> }> = [
  { title: 'spaces', keys: ['trimLines', 'collapseSpaces', 'collapseBlankLines', 'removeDuplicateLines'] },
  { title: 'chars', keys: ['normalizeUnicode', 'normalizePunctuation', 'removeEmoji'] },
  { title: 'privacy', keys: ['removeHtml', 'removeUrls', 'removeEmails'] },
];

function getInitialTheme(): Theme {
  const stored = getStoredPreferences();
  if (stored.theme) return stored.theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredHistory(): HistoryEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return getStoredPreferences().language ?? (navigator.language.startsWith('zh') ? 'zh' : 'en');
  });
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [source, setSource] = useState(() => getStoredDraft().source ?? '');
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [savedHistory, setSavedHistory] = useState<HistoryEntry[]>(getStoredHistory);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [preset, setPreset] = useState<Preset>(() => getStoredPreferences().preset ?? 'basic');
  const [options, setOptions] = useState<CleanerOptions>(() => ({ ...presets.basic, ...getStoredPreferences().options }));
  const [find, setFind] = useState(() => getStoredDraft().find ?? '');
  const [replacement, setReplacement] = useState(() => getStoredDraft().replacement ?? '');
  const [hoverSelect, setHoverSelect] = useState(() => getStoredPreferences().hoverSelect ?? true);
  const [copyNotice, setCopyNotice] = useState<{ id: number; theme: 'success' | 'warning'; text: string } | null>(null);
  const t = getMessages(language);
  const result = useMemo(() => cleanText(source, options, find, replacement), [source, options, find, replacement]);
  const stats = useMemo(() => getStats(source), [source]);
  const resultStats = useMemo(() => getStats(result), [result]);
  const copySegments = useMemo(() => getCopySegments(result), [result]);
  const lastSnapshot = useRef(source);
  const pointerStart = useRef({ x: 0, y: 0, moved: false });
  const noticeTimer = useRef<number | undefined>(undefined);
  const noticeId = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.setAttribute('theme-mode', theme);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1114' : '#f5f7fa');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, theme, preset, options, hoverSelect })); } catch { /* preferences are optional */ }
  }, [hoverSelect, language, theme, options, preset]);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ source, find, replacement })); } catch { /* draft storage can be unavailable */ }
  }, [find, replacement, source]);

  useEffect(() => {
    if (!source.trim()) return;
    const timer = window.setTimeout(() => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(), source, createdAt: Date.now(), preset,
        options: { ...options }, find, replacement,
      };
      setSavedHistory((items) => {
        const latest = items[0];
        const unchanged = latest && latest.source === source && latest.preset === preset
          && latest.find === find && latest.replacement === replacement
          && JSON.stringify(latest.options) === JSON.stringify(options);
        if (unchanged) return items;
        const next = [entry, ...items].slice(0, MAX_HISTORY);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* storage can be unavailable */ }
        return next;
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [find, options, preset, replacement, source]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const showCopyNotice = (theme: 'success' | 'warning', text: string) => {
    window.clearTimeout(noticeTimer.current);
    noticeId.current += 1;
    setCopyNotice({ id: noticeId.current, theme, text });
    noticeTimer.current = window.setTimeout(() => setCopyNotice(null), theme === 'success' ? 1200 : 1800);
  };

  const updateSource = (value: string) => {
    if (lastSnapshot.current !== value) {
      setEditHistory((items) => [...items.slice(-19), lastSnapshot.current]);
      lastSnapshot.current = value;
    }
    setSource(value);
  };

  const choosePreset = (next: Exclude<Preset, 'custom'>) => {
    setPreset(next);
    setOptions(presets[next]);
  };

  const setOption = (key: keyof CleanerOptions, value: boolean) => {
    setPreset('custom');
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const legacyCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;inset:0 auto auto 0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let succeeded = false;
    try { succeeded = document.execCommand('copy'); } catch { /* handled by caller */ }
    textarea.remove();
    return succeeded;
  };

  const copy = async (text: string, all = false) => {
    if (!text) return;
    let succeeded = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        succeeded = true;
      } catch { /* fall back for denied clipboard permission */ }
    }
    if (!succeeded) succeeded = legacyCopy(text);
    if (succeeded) {
      showCopyNotice('success', all ? t.copiedAll : t.copied);
    } else {
      showCopyNotice('warning', t.copyFailed);
    }
  };

  const paste = async () => {
    try { updateSource(await navigator.clipboard.readText()); }
    catch { MessagePlugin.warning(t.pasteFailed); }
  };

  const undo = () => {
    const previous = editHistory.at(-1);
    if (previous === undefined) return;
    setSource(previous);
    lastSnapshot.current = previous;
    setEditHistory((items) => items.slice(0, -1));
  };

  const restoreHistory = (entry: HistoryEntry) => {
    updateSource(entry.source);
    setPreset(entry.preset);
    setOptions(entry.options);
    setFind(entry.find);
    setReplacement(entry.replacement);
    setHistoryVisible(false);
    MessagePlugin.success(t.restored);
  };

  const deleteHistory = (id: string) => {
    setSavedHistory((items) => {
      const next = items.filter((item) => item.id !== id);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* storage can be unavailable */ }
      return next;
    });
  };

  const clearHistory = () => {
    setSavedHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* storage can be unavailable */ }
  };

  const formatHistoryTime = (timestamp: number) => new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(timestamp);

  const handleSegmentClick = (text: string) => {
    if (pointerStart.current.moved) return;
    copy(text);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([result], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cleantext.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      {copyNotice && (
        <div className="copy-message" key={copyNotice.id} role="status" aria-live="polite">
          <Message theme={copyNotice.theme} content={copyNotice.text} />
        </div>
      )}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CleanText home">
          <span className="brand-mark" aria-hidden="true"><span>C</span></span>
          <span>{t.brand}</span>
        </a>
        <div className="header-actions">
          <Button className="history-button" variant="text" icon={<HistoryIcon />} onClick={() => setHistoryVisible(true)}>
            <span>{t.history}</span>{savedHistory.length > 0 && <Tag size="small" shape="round">{savedHistory.length}</Tag>}
          </Button>
          <Tag className="privacy-tag" theme="primary" variant="light-outline"><span className="status-dot" />{t.private}</Tag>
          <Tooltip content={language === 'zh' ? 'Switch to English' : '切换至中文'}>
            <Button variant="text" shape="circle" aria-label="Switch language" icon={<TranslateIcon />} onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} />
          </Tooltip>
          <span className="language-label">{language === 'zh' ? '中' : 'EN'}</span>
          <Tooltip content={theme === 'dark' ? (language === 'zh' ? '切换浅色' : 'Use light theme') : (language === 'zh' ? '切换深色' : 'Use dark theme')}>
            <Button variant="text" shape="circle" aria-label="Toggle color theme" icon={theme === 'dark' ? <SunnyIcon /> : <MoonIcon />} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </Tooltip>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><span /> CLEAN · SHAPE · COPY <span /></div>
          <h1>{t.tagline}</h1>
          <p>{t.subline}</p>
        </section>

        <section className="workspace" aria-label="Text editor and live preview">
          <Card className="editor-card" bordered>
            <div className="panel-header">
              <div><span className="step">01</span><h2>{t.input}</h2></div>
              <div className="panel-actions">
                <Button variant="text" size="small" icon={<PasteIcon />} onClick={paste}>{t.paste}</Button>
                <Button variant="text" size="small" onClick={() => updateSource(t.sampleText)}>{t.sample}</Button>
              </div>
            </div>
            <Textarea
              className="source-input"
              value={source}
              placeholder={t.placeholder}
              onChange={(value) => updateSource(value)}
              autofocus
            />
            <div className="panel-footer">
              <div className="stats-line">
                <span><b>{stats.characters}</b> {t.charsStat}</span><i />
                <span><b>{stats.words}</b> {t.wordsStat}</span><i />
                <span><b>{stats.lines}</b> {t.linesStat}</span>
              </div>
              <div>
                <Button variant="text" size="small" disabled={!editHistory.length} icon={<RollbackIcon />} onClick={undo}>{t.undo}</Button>
                <Button variant="text" size="small" disabled={!source} icon={<DeleteIcon />} onClick={() => updateSource('')}>{t.clear}</Button>
              </div>
            </div>
          </Card>

          <Card className="editor-card output-card" bordered>
            <div className="panel-header">
              <div><span className="step">02</span><h2>{t.output}</h2><Tag size="small" variant="light">LIVE</Tag></div>
              <label className="hover-toggle">
                <span>{t.hoverSelect}</span>
                <Switch size="small" value={hoverSelect} onChange={setHoverSelect} />
              </label>
            </div>
            <div className={`result-area ${!result ? 'is-empty' : ''}`} aria-live="polite">
              {!result ? (
                <div className="empty-state">
                  <span className="empty-glyph">Aa</span>
                  <strong>{t.emptyTitle}</strong>
                  <p>{t.emptyHint}</p>
                </div>
              ) : (
                <div
                  className="result-text"
                  onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY, moved: false }; }}
                  onPointerMove={(event) => {
                    if (event.buttons && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 4) pointerStart.current.moved = true;
                  }}
                >
                  {copySegments.map((segment, index) => <span
                  className={`result-segment ${hoverSelect ? '' : 'is-disabled'}`}
                  key={`${index}-${segment.slice(0, 16)}`}
                  role={hoverSelect ? 'button' : undefined}
                  tabIndex={hoverSelect ? 0 : undefined}
                  title={hoverSelect ? t.hoverHint : undefined}
                  onClick={hoverSelect ? () => handleSegmentClick(segment) : undefined}
                  onKeyDown={hoverSelect ? (event) => { if (event.key === 'Enter' || event.key === ' ') copy(segment); } : undefined}
                >
                  {segment}
                </span>)}
                </div>
              )}
            </div>
            <div className="panel-footer">
              <div className="stats-line">
                <span><b>{resultStats.characters}</b> {t.charsStat}</span><i />
                <span><b>{resultStats.paragraphs}</b> {t.paragraphsStat}</span>
              </div>
              <div>
                <Button variant="text" size="small" disabled={!result} icon={<DownloadIcon />} onClick={download}>{t.download}</Button>
                <Button theme="primary" size="small" disabled={!result} icon={<CopyIcon />} onClick={() => copy(result, true)}>{t.copyAll}</Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="controls-section">
          <div className="controls-heading">
            <div><span className="step">03</span><h2>{t.cleaner}</h2><span>{t.instant}</span></div>
            <span className="autosave"><span className="status-dot" />{t.saved}</span>
          </div>

          <div className="preset-tabs" role="group" aria-label={t.cleaner}>
            {(['basic', 'article', 'developer'] as const).map((key) => (
              <Button key={key} variant={preset === key ? 'base' : 'text'} theme={preset === key ? 'primary' : 'default'} onClick={() => choosePreset(key)}>{t[key]}</Button>
            ))}
            {preset === 'custom' && <Button variant="base" theme="primary">{t.custom}</Button>}
          </div>

          <div className="option-grid">
            {optionGroups.map((group) => (
              <Card className="option-card" key={group.title} bordered>
                <h3>{t[group.title]}</h3>
                {group.keys.map((key) => (
                  <label className="option-row" key={key}>
                    <span>{t[key]}</span>
                    <Switch size="small" value={options[key]} onChange={(value) => setOption(key, value)} />
                  </label>
                ))}
              </Card>
            ))}
          </div>

          <Card className="replace-card" bordered>
            <div className="replace-title"><h3>{t.findReplace}</h3><span>{find ? 'ON' : 'OFF'}</span></div>
            <div className="replace-fields">
              <Input value={find} onChange={setFind} clearable placeholder={t.find} />
              <span className="arrow">→</span>
              <Input value={replacement} onChange={setReplacement} clearable placeholder={t.replace} />
            </div>
          </Card>
        </section>
      </main>

      <Drawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        header={<div className="history-drawer-title"><span>{t.history}</span><small>{t.historySaved}</small></div>}
        footer={false}
        size="420px"
        placement="right"
      >
        {savedHistory.length === 0 ? (
          <div className="history-empty"><HistoryIcon /><strong>{t.noHistory}</strong><span>{t.noHistoryHint}</span></div>
        ) : (
          <div className="history-list">
            <div className="history-list-toolbar"><span>{savedHistory.length} / {MAX_HISTORY}</span><Button variant="text" size="small" onClick={clearHistory}>{t.clearHistory}</Button></div>
            {savedHistory.map((entry, index) => (
              <div className="history-item" key={entry.id}>
                <div className="history-meta"><span>{formatHistoryTime(entry.createdAt)}</span>{index === 0 && <Tag size="small" theme="primary" variant="light">{t.current}</Tag>}<span>{entry.source.length} {t.charsStat}</span></div>
                <p>{entry.source}</p>
                <div className="history-item-actions">
                  <Button theme="primary" variant="outline" size="small" icon={<FileRestoreIcon />} onClick={() => restoreHistory(entry)}>{t.restore}</Button>
                  <Tooltip content={t.deleteRecord}><Button variant="text" theme="danger" shape="circle" size="small" icon={<DeleteIcon />} onClick={() => deleteHistory(entry.id)} /></Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      <footer><span className="brand-mark mini"><span>C</span></span><span>{t.local}</span><span>© 2026 DimLoong</span></footer>
    </div>
  );
}

export default App;
