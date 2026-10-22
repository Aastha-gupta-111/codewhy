import { useState, type ReactNode } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, BookOpen, Check,
  ChevronDown, CircleAlert, Code2, Copy, Database,
  FileCode2,GitPullRequest, HelpCircle, History, Layers3, Network,
  PanelLeft, Search, ShieldCheck, Sparkles, X, Zap, Sun, Moon
} from 'lucide-react'
import './App.css'

type Page = 'investigate' | 'status' | 'timeline' | 'graph' | 'file' | 'shelf' | 'benchmark'
type Outcome = 'full' | 'partial' | 'refusal' | 'ambiguous'

const repositories = [
  { id: 'fastapi', name: 'fastapi/fastapi', description: 'High-performance Python API framework', ready: true },
  { id: 'codewhy-demo', name: 'codewhy/demo-service', description: 'Sample repository for the prototype', ready: true },
]

const decisions = [
  { id: 'DEC-021', date: '2025-08-14', title: 'Limit authentication retries to three attempts', state: 'ACTIVE', rule: 'Current governing decision', quote: 'Limit authentication retries to 3 attempts to prevent repeated credential checks.' },
  { id: 'DEC-014', date: '2025-05-02', title: 'Allow five authentication retries', state: 'SUPERSEDED', rule: 'Replaced by DEC-021', quote: 'Allow up to five retry attempts before returning an authentication failure.' },
  { id: 'DEC-009', date: '2025-02-11', title: 'Retry authentication on transient failures', state: 'REJECTED', rule: 'Rejected during review', quote: 'The original retry proposal did not establish a maximum attempt count.' },
]

const receipts = [
  { id: 'E-01', source: 'pull_request', title: 'Pull request #482', path: 'github.com/example/repo/pull/482', quote: 'Limit authentication retries to 3 attempts to prevent repeated credential checks.', author: 'Example author', date: '2025-08-14', verified: true },
  { id: 'E-02', source: 'commit', title: 'Commit 94918c1d', path: 'github.com/example/repo/commit/94918c1d', quote: 'Retry count is bounded to prevent repeated authentication attempts.', author: 'Example contributor', date: '2025-08-13', verified: false },
]

const suggestions = [
  'Why does authentication retry only 3 times?',
  'Which decision currently governs authentication?',
  'What changed in the retry limit?',
]

function App() {
  const [page, setPage] = useState<Page>('investigate')
  const [repoId, setRepoId] = useState('fastapi')
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState(suggestions[0])
  const [outcome, setOutcome] = useState<Outcome>('full')
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [graphView, setGraphView] = useState<'map' | 'list'>('map')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const repo = repositories.find(r => r.id === repoId) ?? repositories[0]
  const activeReceipt = receipts.find(r => r.id === selectedReceipt)
  const activeDecision = decisions.find(d => d.id === selectedDecision)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  function askQuestion(text: string) {
    const q = text.trim()
    if (!q) return
    setAsked(q)
    setQuestion('')
    setSelectedReceipt(null)
    setSelectedDecision(null)

    // Demo behavior only. Replace this with the real API call later.
    const lower = q.toLowerCase()
    if (lower.includes('obscure') || lower.includes('unknown') || lower.includes('unestablished')) {
      setOutcome('refusal')
    } else if (lower.includes('which one') || lower.includes('which authentication')) {
      setOutcome('ambiguous')
    } else if (lower.includes('conflict') || lower.includes('partially')) {
      setOutcome('partial')
    } else {
      setOutcome('full')
    }
    setPage('investigate')
  }

  async function copyAnswer() {
    const text = `Question: ${asked}\n\n${outcome === 'refusal' ? 'Not established in repository history.' : 'Demo answer: The example decision limits authentication retries to three attempts.'}\n\nEvidence: ${receipts.map(r => `${r.title}: ${r.quote}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
<div className={`app-shell theme-${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Code2 size={23} /></div>
          <div><strong>CodeWhy</strong><span>CODE INVESTIGATION</span></div>
          <button className="icon-btn mobile-menu" aria-label="Close menu"><PanelLeft size={18} /></button>
        </div>

        <div className="repo-picker">
          <label>REPOSITORY</label>
          <div className="select-wrap">
            <Database size={16} />
            <select value={repoId} onChange={e => setRepoId(e.target.value)} aria-label="Select repository">
              {repositories.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="repo-status"><span className="status-dot" /> Demo mode</div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          <NavItem icon={<Sparkles size={17} />} label="Investigate" active={page === 'investigate'} onClick={() => setPage('investigate')} />
          <NavItem icon={<Activity size={17} />} label="Repository status" active={page === 'status'} onClick={() => setPage('status')} />
          <NavItem icon={<History size={17} />} label="Decision timeline" active={page === 'timeline'} onClick={() => setPage('timeline')} />
          <NavItem icon={<Network size={17} />} label="Graph explorer" active={page === 'graph'} onClick={() => setPage('graph')} />
          <NavItem icon={<FileCode2 size={17} />} label="Before you change" active={page === 'file'} onClick={() => setPage('file')} />
          <NavItem icon={<Layers3 size={17} />} label="Tried and failed" active={page === 'shelf'} onClick={() => setPage('shelf')} />
          <NavItem icon={<Zap size={17} />} label="Benchmark" active={page === 'benchmark'} onClick={() => setPage('benchmark')} />
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><BookOpen size={17} /></div>
            <strong>Investigate with evidence</strong>
      
          </div>
          <div className="user-row"><div className="avatar">CW</div><div><strong>CodeWhy Demo</strong><span>Prototype workspace</span></div><HelpCircle size={17} className="muted-icon" /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
  className="icon-btn sidebar-toggle"
  type="button"
  onClick={() => setSidebarCollapsed(value => !value)}
  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  aria-expanded={!sidebarCollapsed}
  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
  <PanelLeft size={19} />
</button>
          <div className="breadcrumb"><span>Repositories</span><ArrowRight size={14} /><strong>{repo.name}</strong></div>
          <div className="topbar-right">
  <button
    type="button"
    className="theme-toggle"
    onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  >
    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
  </button>

  <span className="fixture-badge"><span /> FIXTURE DATA</span>
  <span className="api-indicator"><span /> Demo mode</span>
</div>
        </header>

        {page === 'investigate' && (
          <div className="page-content">
            <div className="page-heading">
              <div><div className="eyebrow"><Sparkles size={14} /> CODE INVESTIGATION</div><h1>Why The Code Is Like This?</h1></div>
              <div className="heading-chip"><ShieldCheck size={16} /> Evidence-first answers</div>
            </div>

            <section className="ask-panel">
              <div className="ask-title"><div className="ask-icon"><Search size={19} /></div><div><h2>Ask about this codebase</h2></div></div>
              <form onSubmit={e => { e.preventDefault(); askQuestion(question) }}>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Why does authentication retry only 3 times?" rows={3} aria-label="Ask a question" />
                <div className="ask-footer"><span><kbd>Enter</kbd> to submit · <kbd>Shift + Enter</kbd> for a new line</span><button className="primary-btn" type="submit">Investigate <ArrowRight size={16} /></button></div>
              </form>
              <div className="suggestion-row"><span>TRY ASKING</span>{suggestions.map(s => <button key={s} onClick={() => askQuestion(s)}>{s}<ArrowDownRight size={13} /></button>)}</div>
            </section>

            <div className="results-header"><div><span className="section-kicker">INVESTIGATION RESULT</span><h2>{asked}</h2></div><button className="secondary-btn" onClick={copyAnswer}><Copy size={15} /> {copied ? 'Copied' : 'Copy answer'}</button></div>
            <section className={`investigation-card outcome-${outcome}`}>
            <OutcomeBanner outcome={outcome} />

            {outcome === 'ambiguous' ? (
              <section className="panel"><h3>Which entity do you mean?</h3><p className="muted-text">Choose an entity to narrow the investigation.</p>{['AuthenticationService', 'RetryConfig'].map(e => <button className="entity-option" key={e} onClick={() => askQuestion(`Why does ${e} use this retry limit?`)}><FileCode2 size={17} />{e}<ArrowRight size={15} /></button>)}</section>
            ) : (
              <>
                <section className="answer-panel">
                  <div className="panel-heading"><div className="panel-icon"><Sparkles size={17} /></div><div><h3>Answer</h3><span>Fixture example · Not a live backend response</span></div><span className="provenance direct">DIRECT QUOTE AVAILABLE</span></div>
                  <p className="answer-copy">{outcome === 'refusal' ? 'The reason for this setting is not established by the available repository evidence. A matching decision or verified source quote is needed before a definitive answer can be given.' : outcome === 'partial' ? 'The available example evidence suggests the retry limit was reduced to three, but the replacement history needs review before this can be treated as fully established.' : 'The example decision limits authentication retries to three attempts. The stated rationale is to prevent repeated credential checks. The evidence below is illustrative fixture data and must be verified against the real repository.'}</p>
                  {outcome === 'refusal' && <div className="missing-evidence"><CircleAlert size={16} /><div><strong>Evidence needed</strong><p>A verified decision quote or a linked pull request that establishes the rationale.</p></div></div>}
                  <div className="answer-meta"><span><Check size={14} /> {outcome === 'full' ? 'Illustrative answer' : outcome === 'partial' ? 'Needs review' : 'Not established'}</span><span>Example repository history</span></div>
                </section>

                {outcome !== 'refusal' && <section className="panel">
                  <div className="section-title-row"><div><h3>Confidence breakdown</h3><p>Ranking signal, not a probability.</p></div><span className={`confidence-label ${outcome === 'partial' ? 'medium' : 'high'}`}>{outcome === 'partial' ? 'MEDIUM' : 'HIGH'}</span></div>
                  <div className="confidence-grid">
                    {[['Evidence quality', 88], ['Decision path', 82], ['Source agreement', 76], ['Recency', 90], ['Entity match', 95]].map(([label, value]) => <div className="confidence-item" key={label}><div><span>{label}</span><strong>{value}%</strong></div><div className="meter"><span style={{ width: `${value}%` }} /></div></div>)}
                  </div>
                  <p className="penalty-note"><CircleAlert size={14} /> Demo scores only. Contradiction penalty and scoring components must come from the backend.</p>
                </section>}

                <section className="panel">
                  <div className="section-title-row"><div><h3>Evidence receipts <span className="count-pill">{outcome === 'refusal' ? '0 verified' : '2 sources'}</span></h3><p>Inspect the source and the quote behind each claim.</p></div><button className="text-btn" onClick={() => setSelectedReceipt(receipts[0].id)}>Inspect first receipt <ArrowRight size={14} /></button></div>
                  {outcome === 'refusal' ? <EmptyState text="No verified quote establishes the answer yet." /> : <div className="receipt-list">{receipts.map(r => <button className={`receipt-card ${selectedReceipt === r.id ? 'selected' : ''}`} key={r.id} onClick={() => setSelectedReceipt(selectedReceipt === r.id ? null : r.id)}>
                    <div className="receipt-top"><span className="receipt-id">{r.id}</span><span className="source-type">{r.source.replace('_', ' ')}</span><span className={`verification ${r.verified ? 'verified' : 'unverified'}`}>{r.verified ? <><Check size={12} /> Verified fixture</> : <><CircleAlert size={12} /> Unverified</>}</span></div>
                    <strong>{r.title}</strong><p className="quote">“{r.quote}”</p><div className="receipt-bottom"><span>{r.author} · {r.date}</span><span className="view-source">Inspect <ArrowRight size={13} /></span></div>
                    {selectedReceipt === r.id && <div className="receipt-detail" onClick={e => e.stopPropagation()}><span className="section-kicker">SOURCE DETAILS</span><p><strong>Source path:</strong> <code>{r.path}</code></p><p><strong>Verification:</strong> {r.verified ? 'Marked verified in demo fixture only; not verified against a live source.' : 'This quote is not verified.'}</p><button className="secondary-btn" onClick={() => setSelectedReceipt(null)}>Close details</button></div>}
                  </button>)}</div>}
                </section>
              </>
            )}
            </section>
            <section className="panel">
              <div className="section-title-row"><div><h3>Decision history</h3><p>Current and historical decisions in the example.</p></div><button className="text-btn" onClick={() => setPage('timeline')}>Full timeline <ArrowRight size={14} /></button></div>
              <Timeline compact onSelect={id => setSelectedDecision(selectedDecision === id ? null : id)} selected={selectedDecision} />
              {activeDecision && <div className="detail-drawer"><button className="drawer-close" onClick={() => setSelectedDecision(null)} aria-label="Close decision detail"><X size={16} /></button><span className="section-kicker">DECISION DETAIL · {activeDecision.id}</span><h3>{activeDecision.title}</h3><p>{activeDecision.rule}</p><blockquote>“{activeDecision.quote}”</blockquote><p className="muted-text">Illustrative decision data. Verify the decision, dates and source with the backend.</p></div>}
            </section>
          </div>
        )}

        {page === 'status' && <div className="page-content"><PageHeading eyebrow="REPRODUCIBILITY" title="Repository status" description="Inspect the stages and dependencies behind this repository." /><div className="stat-grid">{[['Ingestion', 'Fixture', 'Sample data only'], ['Extraction', 'Demo', 'Not checked against backend'], ['Graph', 'Offline / demo', 'No live graph connection'], ['Decisions', '3 examples', 'Illustrative records']].map(([a,b,c]) => <div className="stat-card" key={a}><span>{a}</span><strong>{b}</strong><p>{c}</p></div>)}</div><section className="panel"><h3>Pipeline stages</h3>{[['Repository ingestion', 'Fixture data'], ['Decision extraction', 'Not verified'], ['Knowledge graph', 'Not connected']].map(([a,b]) => <div className="stage-row" key={a}><div><span className="status-dot" />{a}</div><span className="status-tag">{b}</span></div>)}<p className="muted-text">Live counts, timestamps and error summaries will appear after connecting the API.</p></section></div>}

        {page === 'timeline' && <div className="page-content"><PageHeading eyebrow="DECISION HISTORY" title="Decision timeline" description="See how the rules changed, and why older decisions no longer govern." /><section className="panel"><Timeline onSelect={id => setSelectedDecision(selectedDecision === id ? null : id)} selected={selectedDecision} />{activeDecision && <DecisionDetail decision={activeDecision} onClose={() => setSelectedDecision(null)} />}</section></div>}

        {page === 'graph' && <div className="page-content"><PageHeading eyebrow="RELATIONSHIP EXPLORER" title="Knowledge graph" description="Follow connections between code, decisions, pull requests and people." /><section className="panel"><div className="section-title-row"><div><h3>Repository relationships</h3><p>Illustrative nodes — no live graph query has run.</p></div><div className="toggle-group"><button className={graphView === 'map' ? 'active' : ''} onClick={() => setGraphView('map')}>Map</button><button className={graphView === 'list' ? 'active' : ''} onClick={() => setGraphView('list')}>List</button></div></div>{graphView === 'map' ? <div className="graph-canvas"><div className="graph-node code-node"><FileCode2 size={18} /><strong>RetryConfig</strong><span>Code entity</span></div><div className="graph-link"><span>governed by</span><ArrowRight size={19} /></div><button className="graph-node decision-node" onClick={() => { setSelectedDecision('DEC-021'); setPage('timeline') }}><Check size={18} /><strong>DEC-021</strong><span>Active decision</span></button><div className="graph-link"><span>discussed in</span><ArrowRight size={19} /></div><div className="graph-node pr-node"><GitPullRequest size={18} /><strong>PR #482</strong><span>Example pull request</span></div></div> : <div className="graph-list">{[['RetryConfig', 'Code entity', 'GOVERNS → DEC-021'], ['DEC-021', 'Active decision', 'DISCUSSED IN → PR #482'], ['PR #482', 'Pull request', 'CHANGED → RetryConfig']].map(([a,b,c]) => <div className="stage-row" key={a}><div><Network size={17} /><span><strong>{a}</strong><small>{b}</small></span></div><span>{c}</span></div>)}</div>}<div className="legend"><span><i className="legend-code" /> Code</span><span><i className="legend-decision" /> Decision</span><span><i className="legend-pr" /> Pull request</span></div></section></div>}

        {page === 'file' && <div className="page-content"><PageHeading eyebrow="CHANGE SAFETY" title="Before you change this file" description="Review governing decisions and previous attempts before editing code." /><section className="panel"><label className="field-label">SEARCH ENTITIES</label><div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a file or configuration key..." /></div>{['auth/retry_config.py', 'AuthenticationService', 'RETRY_LIMIT'].filter(v => v.toLowerCase().includes(search.toLowerCase())).map(v => <button className="entity-option" key={v} onClick={() => setSearch(v)}><FileCode2 size={17} />{v}<ArrowRight size={15} /></button>)}<div className="brief-block"><h3>Change brief</h3><p>This preview summarizes the example decisions that might govern a file. The real brief must be derived from the backend's entity and decision results.</p><div className="brief-stats"><span><strong>1</strong> active decision</span><span><strong>1</strong> superseded</span><span><strong>1</strong> rejected</span></div><h4>Read first</h4><p>Review DEC-021 and its linked pull request before changing the retry limit.</p><button className="secondary-btn" onClick={() => setPage('timeline')}>Open decision timeline <ArrowRight size={14} /></button></div></section></div>}

        {page === 'shelf' && <div className="page-content"><PageHeading eyebrow="HISTORICAL DECISIONS" title="Tried and failed" description="Review rejected and superseded approaches without mistaking them for current rules." /><section className="panel">{decisions.filter(d => d.state !== 'ACTIVE').map(d => <div className="shelf-card" key={d.id}><div className="receipt-top"><span className="receipt-id">{d.id}</span><span className={`state-tag ${d.state.toLowerCase()}`}>{d.state}</span></div><h3>{d.title}</h3><p>{d.rule}</p><blockquote>“{d.quote}”</blockquote><button className="text-btn" onClick={() => { setSelectedDecision(d.id); setPage('timeline') }}>Inspect decision <ArrowRight size={14} /></button></div>)}</section></div>}

        {page === 'benchmark' && <div className="page-content"><PageHeading eyebrow="EVALUATION" title="Benchmark results" description="Only measured runs belong here. This prototype has not run a benchmark." /><section className="panel benchmark-empty"><div className="empty-icon"><Activity size={25} /></div><h3>No benchmark run recorded</h3><p>Performance and answer-quality metrics will appear here when the backend supplies a real results file.</p><span className="not-run">NOT RUN</span><div className="benchmark-info"><span>Latency p50 <strong>—</strong></span><span>Latency p95 <strong>—</strong></span><span>Model <strong>—</strong></span><span>Run date <strong>—</strong></span></div></section></div>}

        <footer className="footer"><span>CodeWhy <span className="footer-dot">·</span> Evidence-driven code investigation</span><span>Prototype · Fixture data only</span></footer>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{active && <span className="nav-active-mark" />}</button>
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading subpage-heading"><div><div className="eyebrow"><Layers3 size={14} /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>
}

function OutcomeBanner({ outcome }: { outcome: Outcome }) {
  const details = {
    full: { icon: <Check size={17} />, title: 'Answered with evidence', body: 'This is illustrative fixture output, not a verified answer from the live repository.', cls: 'full' },
    partial: { icon: <CircleAlert size={17} />, title: 'Partly established', body: 'Some supporting information is available, but part of the decision history needs review.', cls: 'partial' },
    refusal: { icon: <HelpCircle size={17} />, title: 'Not established in repository history', body: 'The available evidence does not establish the requested rationale. This is a valid result, not an error.', cls: 'refusal' },
    ambiguous: { icon: <Search size={17} />, title: 'Which entity do you mean?', body: 'More than one candidate may match. Select the entity you want to investigate.', cls: 'ambiguous' },
  }
  const d = details[outcome]
  return <div className={`outcome-banner ${d.cls}`}><div className="outcome-icon">{d.icon}</div><div><strong>{d.title}</strong><p>{d.body}</p></div></div>
}

function Timeline({ compact = false, onSelect, selected }: { compact?: boolean; onSelect: (id: string) => void; selected: string | null }) {
  return <div className={`timeline ${compact ? 'compact' : ''}`}>{decisions.map(d => <button className={`timeline-item ${d.state.toLowerCase()} ${selected === d.id ? 'selected' : ''}`} key={d.id} onClick={() => onSelect(d.id)}><div className="timeline-rail"><span className="timeline-dot" /></div><div className="timeline-content"><div className="timeline-meta"><span>{d.date}</span><span className={`state-tag ${d.state.toLowerCase()}`}>{d.state}</span></div><strong>{d.title}</strong><p>{d.rule}</p>{!compact && <blockquote>“{d.quote}”</blockquote>}</div></button>)}</div>
}

function DecisionDetail({ decision, onClose }: { decision: typeof decisions[number]; onClose: () => void }) {
  return <div className="detail-drawer"><button className="drawer-close" onClick={onClose} aria-label="Close decision detail"><X size={16} /></button><span className="section-kicker">DECISION DETAIL · {decision.id}</span><h3>{decision.title}</h3><p>{decision.date} · {decision.state}</p><blockquote>“{decision.quote}”</blockquote><p className="muted-text">Example fixture. Verify the source and supersession relationship with the backend.</p></div>
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><HelpCircle size={20} /><p>{text}</p></div>
}

export default App

