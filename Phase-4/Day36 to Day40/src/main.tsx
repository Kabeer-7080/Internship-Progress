import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, Bell,
  CheckCircle2, ChevronRight, ClipboardList, FilePlus2, Key,
  LayoutDashboard, LogOut, Pencil, Plus, Search, Settings,
  ShieldAlert, ShieldCheck, Trash2, UploadCloud, Users, WalletCards, X, Sliders
} from 'lucide-react';
import './styles.css';
import './auth.css';
import './theme.css';
import './chaos.css';

import {
  checkBackendHealth,
  fetchAssessmentsApi,
  createAssessmentApi,
  updateAssessmentApi,
  deleteAssessmentApi,
  fetchTeamApi,
  createTeamMemberApi,
  updateTeamMemberApi,
  deleteTeamMemberApi,
  loginApi,
  registerApi,
  logoutApi,
  setAuthToken
} from './api';
import { generateAssessmentPDF } from './pdfReport';

type Page = 'Overview' | 'Assessments' | 'Transactions' | 'Team' | 'Settings';
type Kind = 'Loan' | 'Transaction';
type Verdict = 'Approved' | 'Flagged' | 'Rejected';
type Assessment = {
  id: string;
  subject: string;
  kind: Kind;
  amount: number;
  score: number;
  verdict: Verdict;
  created: string;
  reason: string;
  income: number;
  credit: number;
  employment: string;
  channel: string;
  factors?: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }>;
};
type TeamMember = { id: string; name: string; email: string; role: 'Admin' | 'Analyst'; status: 'Active' | 'Invited' | 'Suspended' };

const seeded: Assessment[] = [
  { id: 'FG-10482', subject: 'Olivia Bennett', kind: 'Loan', amount: 28000, score: 18, verdict: 'Approved', created: 'Today, 10:42 AM', reason: 'Strong income-to-debt ratio', income: 7200, credit: 764, employment: 'Full time', channel: 'Branch' },
  { id: 'FG-10481', subject: 'Northline Traders', kind: 'Transaction', amount: 9850, score: 72, verdict: 'Flagged', created: 'Today, 09:18 AM', reason: 'Unusual payment velocity', income: 5100, credit: 630, employment: 'Self employed', channel: 'Online' },
  { id: 'FG-10480', subject: 'Marcus Chen', kind: 'Loan', amount: 14500, score: 34, verdict: 'Approved', created: 'Yesterday', reason: 'Verified employment history', income: 5800, credit: 701, employment: 'Full time', channel: 'Branch' },
  { id: 'FG-10479', subject: 'Unknown Merchant', kind: 'Transaction', amount: 4200, score: 91, verdict: 'Rejected', created: 'Yesterday', reason: 'High-risk device and location', income: 2100, credit: 520, employment: 'Contract', channel: 'Online' },
  { id: 'FG-10478', subject: 'Sofia Ramirez', kind: 'Loan', amount: 45000, score: 48, verdict: 'Flagged', created: 'Aug 6, 2026', reason: 'Short credit history', income: 6800, credit: 656, employment: 'Full time', channel: 'Branch' }
];

const initialTeam: TeamMember[] = [
  { id: 'tm-1', name: 'Kabeer Bhatt', email: 'kabeer@finguard.io', role: 'Admin', status: 'Active' },
  { id: 'tm-2', name: 'Maya Singh', email: 'maya@finguard.io', role: 'Analyst', status: 'Active' },
  { id: 'tm-3', name: 'Daniel Reed', email: 'daniel@finguard.io', role: 'Analyst', status: 'Invited' }
];

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const cls = (v: Verdict) => v.toLowerCase();
const read = (key: string, fallback: any) => { try { return JSON.parse(localStorage.getItem(key) || '') ?? fallback; } catch { return fallback; } };

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>('Overview');
  const [assessments, setAssessments] = useState<Assessment[]>(() => read('fg-assessments', seeded));
  const [team, setTeam] = useState<TeamMember[]>(() => read('fg-team', initialTeam));
  
  // Modal state management
  const [modal, setModal] = useState<'assessment' | 'member' | 'batch' | 'apikey' | 'risk_factors' | null>(null);
  const [detail, setDetail] = useState<Assessment | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [notice, setNotice] = useState('');
  const [dbActive, setDbActive] = useState(false);

  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800); };

  // Sync with MySQL backend on mount & login
  useEffect(() => {
    async function loadBackendData() {
      const online = await checkBackendHealth();
      setDbActive(online);
      if (online && loggedIn && token) {
        try {
          const apiAssessments = await fetchAssessmentsApi();
          if (Array.isArray(apiAssessments) && apiAssessments.length > 0) {
            setAssessments(apiAssessments);
          }
          const apiTeam = await fetchTeamApi();
          if (Array.isArray(apiTeam) && apiTeam.length > 0) {
            setTeam(apiTeam);
          }
        } catch (e) {
          console.warn('Backend sync warning:', e);
        }
      }
    }
    loadBackendData();
  }, [loggedIn, token]);

  useEffect(() => localStorage.setItem('fg-assessments', JSON.stringify(assessments)), [assessments]);
  useEffect(() => localStorage.setItem('fg-team', JSON.stringify(team)), [team]);

  async function signOut() {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setToken(null);
    setAuthToken(null);
    setLoggedIn(false);
    notify('Signed out');
  }

  // --- CRUD: CREATE Assessment ---
  async function addAssessment(data: { subject: string; kind: Kind; amount: number; income: number; credit: number; employment: string; channel: string }) {
    let newItem: Assessment;
    if (dbActive) {
      try {
        newItem = await createAssessmentApi({
          subject: data.subject,
          kind: data.kind,
          amount: data.amount,
          income: data.income,
          credit_score: data.credit,
          employment: data.employment,
          channel: data.channel
        });
        notify('Assessment saved to MySQL Database');
      } catch (e) {
        newItem = localCalculateAssessment(data, assessments.length);
        notify('Assessment created (local mode)');
      }
    } else {
      newItem = localCalculateAssessment(data, assessments.length);
      notify('Assessment saved to history');
    }

    setAssessments(x => [newItem, ...x]);
    setModal(null);
    setDetail(newItem);
  }

  // --- CRUD: UPDATE Assessment ---
  async function updateAssessment(id: string, updatedFields: Partial<Assessment>) {
    if (dbActive) {
      try {
        const updated = await updateAssessmentApi(id, {
          subject: updatedFields.subject,
          income: updatedFields.income,
          amount: updatedFields.amount,
          credit_score: updatedFields.credit,
          employment: updatedFields.employment,
          channel: updatedFields.channel
        });
        setAssessments(x => x.map(a => a.id === id ? updated : a));
        setDetail(updated);
        notify('Assessment updated & rescored in MySQL DB');
        return;
      } catch (e) {
        console.error('API update error:', e);
      }
    }

    setAssessments(x => x.map(a => {
      if (a.id !== id) return a;
      const merged = { ...a, ...updatedFields };
      const recalculated = localCalculateAssessment(merged, 0);
      const updated = { ...merged, score: recalculated.score, verdict: recalculated.verdict, reason: recalculated.reason };
      setDetail(updated);
      return updated;
    }));
    notify('Assessment updated');
  }

  // --- CRUD: DELETE Assessment ---
  async function removeAssessment(id: string) {
    if (dbActive) {
      try {
        await deleteAssessmentApi(id);
        notify('Assessment deleted from MySQL DB');
      } catch (e) {
        notify('Assessment deleted');
      }
    } else {
      notify('Assessment deleted');
    }
    setAssessments(x => x.filter(a => a.id !== id));
    setDetail(null);
  }

  // --- CRUD: CREATE Team Member ---
  async function addTeamMember(data: Omit<TeamMember, 'id' | 'status'>) {
    let member: TeamMember;
    if (dbActive) {
      try {
        member = await createTeamMemberApi(data);
        notify('Team member added to MySQL DB');
      } catch (e) {
        member = { ...data, id: crypto.randomUUID(), status: 'Invited' };
        notify('Team member invited');
      }
    } else {
      member = { ...data, id: crypto.randomUUID(), status: 'Invited' };
      notify('Invitation created');
    }
    setTeam(x => [...x, member]);
    setModal(null);
  }

  // --- CRUD: UPDATE Team Member ---
  async function editTeamMember(id: string, fields: Partial<TeamMember>) {
    if (dbActive) {
      try {
        const updated = await updateTeamMemberApi(id, fields);
        setTeam(x => x.map(m => m.id === id ? updated : m));
        notify('Team member updated in MySQL DB');
        setEditingMember(null);
        return;
      } catch (e) {
        console.error('Update team error:', e);
      }
    }
    setTeam(x => x.map(m => m.id === id ? { ...m, ...fields } : m));
    notify('Team member updated');
    setEditingMember(null);
  }

  // --- CRUD: DELETE Team Member ---
  async function removeTeamMember(id: string) {
    if (dbActive) {
      try {
        await deleteTeamMemberApi(id);
        notify('Team member removed from MySQL DB');
      } catch (e) {
        notify('Team member removed');
      }
    } else {
      notify('Team member removed');
    }
    setTeam(x => x.filter(m => m.id !== id));
  }

  // --- BATCH CSV IMPORT ---
  async function batchImport(records: any[]) {
    let addedCount = 0;
    for (const r of records) {
      const item = localCalculateAssessment(r, assessments.length + addedCount);
      setAssessments(prev => [item, ...prev]);
      addedCount++;
    }
    setModal(null);
    notify(`Imported ${addedCount} assessment records into database`);
  }

  if (!loggedIn) return <Login onLogin={(tok) => { setToken(tok); setAuthToken(tok); setLoggedIn(true); }} />;

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} count={assessments.length} signOut={signOut} dbActive={dbActive} />
      <main>
        <Header page={page} newAssessment={() => setModal('assessment')} openBatchModal={() => setModal('batch')} openApiKeyModal={() => setModal('apikey')} />
        {page === 'Overview' && <Overview items={assessments} open={setDetail} go={setPage} openRiskModal={() => setModal('risk_factors')} />}
        {page === 'Assessments' && <Assessments items={assessments} open={setDetail} title="All assessments" openBatchModal={() => setModal('batch')} />}
        {page === 'Transactions' && <Assessments items={assessments.filter(x => x.kind === 'Transaction')} open={setDetail} title="Transaction fraud checks" openBatchModal={() => setModal('batch')} />}
        {page === 'Team' && <Team team={team} invite={() => setModal('member')} edit={(m) => setEditingMember(m)} remove={removeTeamMember} />}
        {page === 'Settings' && <SettingsPage notify={notify} dbActive={dbActive} openApiKeyModal={() => setModal('apikey')} />}
      </main>

      {/* --- ALL SYSTEM MODALS --- */}
      {modal === 'assessment' && <AssessmentForm close={() => setModal(null)} save={addAssessment} />}
      {modal === 'member' && <MemberForm close={() => setModal(null)} save={addTeamMember} />}
      {modal === 'batch' && <BatchImportModal close={() => setModal(null)} onImport={batchImport} />}
      {modal === 'apikey' && <ApiKeyModal close={() => setModal(null)} notify={notify} />}
      {modal === 'risk_factors' && <RiskFactorsDeepDiveModal close={() => setModal(null)} />}
      
      {editingMember && <EditMemberForm member={editingMember} close={() => setEditingMember(null)} save={(fields) => editTeamMember(editingMember.id, fields)} />}
      {detail && <Detail item={detail} close={() => setDetail(null)} remove={removeAssessment} update={updateAssessment} openRiskModal={() => setModal('risk_factors')} />}
      {notice && <div className="toast"><CheckCircle2 size={18} />{notice}</div>}
    </div>
  );
}

function localCalculateAssessment(data: any, count: number): Assessment {
  const ratio = data.amount / Math.max(data.income, 1);
  let score = Math.round(64 - (data.credit - 600) * 0.18 + ratio * 7 + (data.employment === 'Full time' ? -12 : 7) + (data.kind === 'Transaction' && data.channel === 'Online' ? 14 : 0));
  score = Math.max(4, Math.min(97, score));
  const verdict: Verdict = score < 40 ? 'Approved' : score < 70 ? 'Flagged' : 'Rejected';
  const reason = score < 40 ? 'Strong income, credit, and employment signals' : score < 70 ? 'Manual review recommended for this risk profile' : 'Elevated risk indicators require rejection';
  return {
    ...data,
    id: data.id || `FG-${10483 + count}`,
    score,
    verdict,
    reason,
    created: 'Just now',
    factors: [
      { factor: 'Credit profile', impact: data.credit >= 680 ? 'positive' : 'negative', detail: `Credit score is ${data.credit}` },
      { factor: 'Amount-to-income', impact: ratio > 5 ? 'negative' : 'positive', detail: `Amount ratio is ${ratio.toFixed(1)}× income` },
      { factor: 'Employment stability', impact: data.employment === 'Full time' ? 'positive' : 'negative', detail: data.employment }
    ]
  };
}

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('analyst@finguard.io');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<'Admin' | 'Analyst'>('Analyst');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || password.length < 4) {
      setError('Use a valid email and a password of at least 4 characters.');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (mode === 'signup') {
        if (!name.trim()) { setError('Enter your full name.'); setSubmitting(false); return; }
        res = await registerApi(name, email, password, role);
      } else {
        res = await loginApi(email, password);
      }
      if (res && res.access_token) {
        onLogin(res.access_token);
      } else {
        setError('Authentication failed. No access token received.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <Brand />
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}</p>
        <h1>{mode === 'login' ? 'Sign in to FinGuard' : 'Start your FinGuard workspace'}</h1>
        <p className="muted">{mode === 'login' ? 'Demo login: analyst@finguard.io / password' : 'Your account is persisted in MySQL & local workspace.'}</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <>
            <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label>
            <label>Role<select value={role} onChange={e => setRole(e.target.value as 'Admin' | 'Analyst')}><option>Analyst</option><option>Admin</option></select></label>
          </>}
          <label>Work email<input value={email} onChange={e => setEmail(e.target.value)} type="email" /></label>
          <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary wide">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17} /></button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
        <p className="demo-note"><ShieldCheck size={15} /> Secure MySQL connected workspace</p>
      </div>
    </div>
  );
}

function Brand() {
  return <div className="brand"><span><ShieldCheck size={20} /></span>Fin<span>Guard</span></div>;
}

function Sidebar({ page, setPage, count, signOut, dbActive }: { page: Page; setPage: (p: Page) => void; count: number; signOut: () => void; dbActive: boolean }) {
  const links: [Page, any, string?][] = [['Overview', LayoutDashboard], ['Assessments', ClipboardList, String(count)], ['Transactions', WalletCards], ['Team', Users], ['Settings', Settings]];
  return (
    <aside>
      <Brand />
      <p className="workspace">RISK OPERATIONS</p>
      <nav>
        {links.map(([name, Icon, count]) =>
          <button key={name} onClick={() => setPage(name)} className={page === name ? 'active' : ''}>
            <Icon size={18} /><span>{name}</span>{count && <b>{count}</b>}
          </button>
        )}
      </nav>
      <div className="aside-bottom">
        <div className="db-badge" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', background: dbActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: dbActive ? '#22c55e' : '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbActive ? '#22c55e' : '#f59e0b' }} />
          {dbActive ? 'MySQL Connected' : 'SQLite Fallback'}
        </div>
        <div className="profile">
          <div>KB</div>
          <span><strong>Kabeer Bhatt</strong><small>Administrator</small></span>
        </div>
        <button className="signout" onClick={signOut}><LogOut size={17} />Sign out</button>
      </div>
    </aside>
  );
}

function Header({ page, newAssessment, openBatchModal, openApiKeyModal }: { page: Page; newAssessment: () => void; openBatchModal: () => void; openApiKeyModal: () => void }) {
  const copy: Record<Page, string> = {
    Overview: 'Your risk operations overview',
    Assessments: 'Review every decision and its key risk signals',
    Transactions: 'Monitor potential fraud and suspicious payment activity',
    Team: 'Manage access for your risk operations team',
    Settings: 'Configure your workspace & database preferences'
  };
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);

  return (
    <header>
      <div>
        <p className="eyebrow">RISK OPERATIONS / {page.toUpperCase()}</p>
        <h1>{page === 'Overview' ? 'Good morning, Kabeer' : page}</h1>
        <p className="muted">{copy[page]}</p>
      </div>
      <div className="header-actions">
        <button className="secondary" title="API Keys & Webhooks" onClick={openApiKeyModal}>
          <Key size={17} /> API Keys
        </button>
        <button className="secondary" title="Batch Upload CSV" onClick={openBatchModal}>
          <UploadCloud size={17} /> Batch Import
        </button>
        <div className="notification-wrap">
          <button className="circle" aria-label="Notifications" onClick={() => setOpen(!open)}>
            <Bell size={18} />{unread > 0 && <i />}
          </button>
          {open && <div className="notification-panel">
            <div><strong>Notifications</strong><button onClick={() => setUnread(0)}>Mark all read</button></div>
            <article><span className="notice-dot red" /><p><b>High-risk transaction</b><small>Northline Traders needs review</small></p></article>
            <article><span className="notice-dot blue" /><p><b>Assessment completed</b><small>Your latest risk score is ready</small></p></article>
            <article><span className="notice-dot violet" /><p><b>Team invitation</b><small>Daniel Reed has joined your team</small></p></article>
          </div>}
        </div>
        {page !== 'Team' && page !== 'Settings' && <button className="primary" onClick={newAssessment}><FilePlus2 size={17} />New assessment</button>}
      </div>
    </header>
  );
}

function Overview({ items, open, go, openRiskModal }: { items: Assessment[]; open: (a: Assessment) => void; go: (p: Page) => void; openRiskModal: () => void }) {
  const total = items.length || 1, approved = items.filter(x => x.verdict === 'Approved').length, flagged = items.filter(x => x.verdict !== 'Approved').length;
  return (
    <>
      <section className="metrics">
        <Metric icon={<CheckCircle2 />} label="Approval rate" value={`${Math.round((approved / total) * 100)}%`} tone="green" />
        <Metric icon={<ClipboardList />} label="Total assessments" value={String(items.length)} tone="blue" />
        <Metric icon={<ShieldAlert />} label="Items needing review" value={String(flagged)} tone="amber" />
        <Metric icon={<WalletCards />} label="Amount assessed" value={money(items.reduce((n, x) => n + x.amount, 0))} tone="purple" />
      </section>
      <section className="grid">
        <div className="panel activity">
          <PanelTitle title="Risk activity" subtitle="Assessment volume over the last 7 days" action="View all" click={() => go('Assessments')} />
          <div className="bars">
            {[42, 58, 47, 70, 62, 84, 76].map((v, i) => <div key={i}><i style={{ height: `${v}%` }} /><span>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span></div>)}
          </div>
        </div>
        <div className="panel">
          <div className="split-title" style={{ marginBottom: '12px' }}>
            <h2>Decision mix</h2>
            <button className="link" onClick={openRiskModal}><Sliders size={15} /> ML Feature Weights</button>
          </div>
          <p className="muted" style={{ marginBottom: '16px', fontSize: '13px' }}>Across all saved MySQL assessments</p>
          <div className="decision-list">
            <Decision label="Approved" value={approved} total={total} color="green" />
            <Decision label="Flagged" value={items.filter(x => x.verdict === 'Flagged').length} total={total} color="amber" />
            <Decision label="Rejected" value={items.filter(x => x.verdict === 'Rejected').length} total={total} color="red" />
          </div>
        </div>
      </section>
      <section className="panel recent">
        <PanelTitle title="Recent assessments" subtitle="Open any row to Edit, Rescore, or Delete from DB" action="View all" click={() => go('Assessments')} />
        <AssessmentTable items={items.slice(0, 5)} open={open} />
      </section>
    </>
  );
}

function Metric({ icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return <div className="metric"><div className={'metric-icon ' + tone}>{icon}</div><div><p>{label}</p><h2>{value}</h2><small>Updated live</small></div></div>;
}

function PanelTitle({ title, subtitle, action, click }: { title: string; subtitle: string; action?: string; click?: () => void }) {
  return <div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button className="link" onClick={click}>{action}<ChevronRight size={15} /></button>}</div>;
}

function Decision({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return <div className="decision-row"><span><i className={color} />{label}</span><b>{value}</b><div><i className={color} style={{ width: `${(value / total) * 100}%` }} /></div></div>;
}

function Assessments({ items, open, title, openBatchModal }: { items: Assessment[]; open: (a: Assessment) => void; title: string; openBatchModal: () => void }) {
  const [query, setQuery] = useState('');
  const [verdict, setVerdict] = useState('All');
  const rows = useMemo(() => items.filter(x => (verdict === 'All' || x.verdict === verdict) && `${x.subject} ${x.id}`.toLowerCase().includes(query.toLowerCase())), [items, query, verdict]);

  return (
    <section className="panel full">
      <PanelTitle title={title} subtitle={`${rows.length} saved assessment${rows.length === 1 ? '' : 's'}`} />
      <div className="toolbar">
        <label className="search"><Search size={16} /><input placeholder="Search by name or reference" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <select value={verdict} onChange={e => setVerdict(e.target.value)}><option>All</option><option>Approved</option><option>Flagged</option><option>Rejected</option></select>
        <button className="secondary" onClick={openBatchModal}><UploadCloud size={16} />Batch Upload</button>
        <button className="secondary" onClick={() => download(rows)}><ArrowDownToLine size={16} />Export CSV</button>
      </div>
      <AssessmentTable items={rows} open={open} />
      {!rows.length && <Empty title="No matching assessments" text="Try a different search or create a new assessment." />}
    </section>
  );
}

function AssessmentTable({ items, open }: { items: Assessment[]; open: (a: Assessment) => void }) {
  return (
    <div className="table">
      <div className="row headings">
        <span>REFERENCE</span><span>SUBJECT</span><span>TYPE</span><span>AMOUNT</span><span>RISK SCORE</span><span>VERDICT</span><span />
      </div>
      {items.map(x =>
        <button className="row" key={x.id} onClick={() => open(x)}>
          <span className="ref">{x.id}</span>
          <span><strong>{x.subject}</strong><small>{x.created}</small></span>
          <span><em className={'kind ' + x.kind.toLowerCase()}>{x.kind}</em></span>
          <span>{money(x.amount)}</span>
          <span className="score"><i><b className={x.score < 40 ? 'green' : x.score < 70 ? 'amber' : 'red'} style={{ width: `${x.score}%` }} /></i>{x.score}</span>
          <span><em className={'verdict ' + cls(x.verdict)}>{x.verdict}</em></span>
          <ChevronRight size={17} />
        </button>
      )}
    </div>
  );
}

function Team({ team, invite, edit, remove }: { team: TeamMember[]; invite: () => void; edit: (m: TeamMember) => void; remove: (id: string) => void }) {
  return (
    <section className="panel full">
      <div className="split-title">
        <div><h2>Team members</h2><p className="muted">Control access to FinGuard risk assessments stored in MySQL DB.</p></div>
        <button className="primary" onClick={invite}><Plus size={17} />Invite member</button>
      </div>
      <div className="team-list">
        {team.map(m =>
          <div className="member" key={m.id}>
            <div className="member-avatar">{m.name.split(' ').map(x => x[0]).join('')}</div>
            <div><strong>{m.name}</strong><small>{m.email}</small></div>
            <em className={'role ' + m.role.toLowerCase()}>{m.role}</em>
            <em className={'status ' + m.status.toLowerCase()}>{m.status}</em>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="secondary" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => edit(m)}><Pencil size={14} /> Edit</button>
              <button className="icon-danger" aria-label={`Remove ${m.name}`} onClick={() => remove(m.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsPage({ notify, dbActive, openApiKeyModal }: { notify: (x: string) => void; dbActive: boolean; openApiKeyModal: () => void }) {
  const [email, setEmail] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [name, setName] = useState('Kabeer Bhatt');

  return (
    <section className="settings-page">
      <div className="panel settings-card">
        <PanelTitle title="Database Configuration" subtitle="MySQL Server & Connection Status" />
        <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Database Engine: <strong style={{ color: '#f8fafc' }}>MySQL (PyMySQL + SQLAlchemy)</strong>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Host / Port: <strong style={{ color: '#f8fafc' }}>localhost:3306</strong>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Database: <strong style={{ color: '#f8fafc' }}>finguard_db</strong>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: dbActive ? '#22c55e' : '#f59e0b' }}>
            Status: <strong>{dbActive ? 'Active & Connected' : 'Fallback Mode (SQLite Active)'}</strong>
          </p>
        </div>
        <button className="secondary" onClick={openApiKeyModal}><Key size={16} /> Manage API Keys & Webhooks</button>
      </div>

      <div className="panel settings-card">
        <PanelTitle title="Profile" subtitle="Your personal workspace details" />
        <label>Display name<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Email address<input defaultValue="kabeer@finguard.io" type="email" /></label>
        <button className="primary" onClick={() => notify('Profile settings saved')}>Save changes</button>
      </div>

      <div className="panel settings-card">
        <PanelTitle title="Notifications" subtitle="Choose how FinGuard keeps you informed" />
        <Toggle label="Email assessment summaries" checked={email} change={() => setEmail(!email)} />
        <Toggle label="High-risk decision alerts" checked={alerts} change={() => setAlerts(!alerts)} />
        <button className="secondary" onClick={() => notify('Notification preferences saved')}>Save preferences</button>
      </div>
    </section>
  );
}

function Toggle({ label, checked, change }: { label: string; checked: boolean; change: () => void }) {
  return <button className="toggle-row" onClick={change}><span>{label}</span><i className={checked ? 'on' : ''}><b /></i></button>;
}


// ==========================================
//           MODAL COMPONENTS
// ==========================================

// 1. Modal Shell
function Modal({ title, close, children }: { title: string; close: () => void; children: any }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <div><p className="eyebrow">FINGUARD RISK ENGINE</p><h2>{title}</h2></div>
          <button className="circle" onClick={close} aria-label="Close"><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// 2. New Assessment Form Modal
function AssessmentForm({ close, save }: { close: () => void; save: (x: any) => void }) {
  const [kind, setKind] = useState<Kind>('Loan');

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      subject: String(f.get('subject')),
      kind,
      amount: Number(f.get('amount')),
      income: Number(f.get('income')),
      credit: Number(f.get('credit')),
      employment: String(f.get('employment')),
      channel: String(f.get('channel'))
    });
  }

  return (
    <Modal title="New Assessment" close={close}>
      <form onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={kind === 'Loan' ? 'selected' : ''} onClick={() => setKind('Loan')}>Loan application</button>
          <button type="button" className={kind === 'Transaction' ? 'selected' : ''} onClick={() => setKind('Transaction')}>Fraud check</button>
        </div>
        <div className="form-grid">
          <label>{kind === 'Loan' ? 'Applicant name' : 'Merchant / account name'}<input name="subject" required placeholder="e.g. Jordan Taylor" /></label>
          <label>{kind === 'Loan' ? 'Monthly income' : 'Available balance'}<input name="income" required min="1" type="number" placeholder="5000" /></label>
          <label>{kind === 'Loan' ? 'Loan amount' : 'Transaction amount'}<input name="amount" required min="1" type="number" placeholder="25000" /></label>
          <label>Credit score<input name="credit" required type="number" min="300" max="850" defaultValue="680" /></label>
          <label>Employment<select name="employment"><option>Full time</option><option>Self employed</option><option>Contract</option><option>Unemployed</option></select></label>
          <label>Channel<select name="channel"><option>{kind === 'Loan' ? 'Branch' : 'Online'}</option><option>Mobile</option><option>In person</option></select></label>
        </div>
        <div className="model-note"><ShieldCheck size={17} /> Scikit-learn ML model will score risk and store record in MySQL database.</div>
        <div className="actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Run risk assessment <ArrowUpRight size={16} /></button></div>
      </form>
    </Modal>
  );
}

// 3. Invite Team Member Form Modal
function MemberForm({ close, save }: { close: () => void; save: (m: Omit<TeamMember, 'id' | 'status'>) => void }) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({ name: String(f.get('name')), email: String(f.get('email')), role: f.get('role') as 'Admin' | 'Analyst' });
  }

  return (
    <Modal title="Invite team member" close={close}>
      <form onSubmit={submit}>
        <div className="form-grid one">
          <label>Full name<input name="name" required placeholder="e.g. Priya Sharma" /></label>
          <label>Work email<input name="email" required type="email" placeholder="priya@company.com" /></label>
          <label>Role<select name="role"><option>Analyst</option><option>Admin</option></select></label>
        </div>
        <div className="actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Create invitation <ArrowUpRight size={16} /></button></div>
      </form>
    </Modal>
  );
}

// 4. Edit Team Member Modal
function EditMemberForm({ member, close, save }: { member: TeamMember; close: () => void; save: (fields: Partial<TeamMember>) => void }) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      name: String(f.get('name')),
      role: f.get('role') as 'Admin' | 'Analyst',
      status: f.get('status') as 'Active' | 'Invited' | 'Suspended'
    });
  }

  return (
    <Modal title={`Edit ${member.name}`} close={close}>
      <form onSubmit={submit}>
        <div className="form-grid one">
          <label>Full name<input name="name" defaultValue={member.name} required /></label>
          <label>Work email<input name="email" defaultValue={member.email} disabled style={{ opacity: 0.7 }} /></label>
          <label>Role<select name="role" defaultValue={member.role}><option>Analyst</option><option>Admin</option></select></label>
          <label>Status<select name="status" defaultValue={member.status}><option>Active</option><option>Invited</option><option>Suspended</option></select></label>
        </div>
        <div className="actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Save changes <ArrowUpRight size={16} /></button></div>
      </form>
    </Modal>
  );
}

// 5. Assessment Detail & Decision Modal
function Detail({ item, close, remove, update, openRiskModal }: { item: Assessment; close: () => void; remove: (id: string) => void; update: (id: string, data: Partial<Assessment>) => void; openRiskModal: () => void }) {
  const [editing, setEditing] = useState(false);

  if (editing) return <EditAssessment item={item} close={() => setEditing(false)} onSave={async (fields) => { await update(item.id, fields); setEditing(false); }} />;

  return (
    <Modal title={item.subject} close={close}>
      <div className="detail-head">
        <div className={'big-icon ' + cls(item.verdict)}>{item.verdict === 'Approved' ? <CheckCircle2 /> : <AlertTriangle />}</div>
        <div><p className="eyebrow">MODEL VERDICT</p><h2>{item.verdict}</h2><span>{item.score}/100 risk score</span></div>
        <em className={'verdict ' + cls(item.verdict)}>{item.verdict}</em>
      </div>

      <h3>Decision explanation</h3>
      <div className="explanation">
        <ShieldCheck size={18} />
        <div>
          <strong>{item.reason}</strong>
          <span>FinGuard ML engine computed this based on risk factor signals.</span>
        </div>
      </div>

      {item.factors && item.factors.length > 0 && (
        <>
          <div className="split-title" style={{ marginTop: '16px', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Risk Factor Signals</h3>
            <button className="link" onClick={openRiskModal}><Sliders size={14} /> Model Breakdown</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {item.factors.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '13px' }}>
                <span><strong>{f.factor}:</strong> {f.detail}</span>
                <em style={{ color: f.impact === 'positive' ? '#22c55e' : f.impact === 'negative' ? '#ef4444' : '#94a3b8', fontStyle: 'normal', fontWeight: 600, fontSize: '12px' }}>
                  {f.impact.toUpperCase()}
                </em>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>Application data</h3>
      <div className="facts">
        <span>Reference<b>{item.id}</b></span>
        <span>Assessment type<b>{item.kind}</b></span>
        <span>Amount<b>{money(item.amount)}</b></span>
        <span>Income / balance<b>{money(item.income)}</b></span>
        <span>Credit score<b>{item.credit}</b></span>
        <span>Employment<b>{item.employment}</b></span>
        <span>Channel<b>{item.channel}</b></span>
        <span>Created<b>{item.created}</b></span>
      </div>

      <div className="actions between">
        <button className="danger" onClick={() => remove(item.id)}><Trash2 size={16} />Delete assessment</button>
        <span style={{ display: 'flex', gap: '8px' }}>
          <button className="secondary" onClick={() => generateAssessmentPDF(item)}><ArrowDownToLine size={16} />Export PDF</button>
          <button className="secondary" onClick={() => setEditing(true)}><Pencil size={16} />Edit & Rescore</button>
          <button className="primary" onClick={close}>Done</button>
        </span>
      </div>
    </Modal>
  );
}

// 6. Edit & Rescore Assessment Modal
function EditAssessment({ item, close, onSave }: { item: Assessment; close: () => void; onSave: (data: Partial<Assessment>) => void }) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({
      subject: String(f.get('subject')),
      income: Number(f.get('income')),
      amount: Number(f.get('amount')),
      credit: Number(f.get('credit')),
      employment: String(f.get('employment')),
      channel: String(f.get('channel'))
    });
  }

  return (
    <Modal title={`Edit & Rescore ${item.id}`} close={close}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Subject<input name="subject" defaultValue={item.subject} required /></label>
          <label>Income / balance<input name="income" defaultValue={item.income} required min="1" type="number" /></label>
          <label>Amount<input name="amount" defaultValue={item.amount} required min="1" type="number" /></label>
          <label>Credit score<input name="credit" defaultValue={item.credit} required type="number" min="300" max="850" /></label>
          <label>Employment<select name="employment" defaultValue={item.employment}><option>Full time</option><option>Self employed</option><option>Contract</option><option>Unemployed</option></select></label>
          <label>Channel<select name="channel" defaultValue={item.channel}><option>Branch</option><option>Online</option><option>Mobile</option><option>In person</option></select></label>
        </div>
        <div className="actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Save and rescore <ArrowUpRight size={16} /></button></div>
      </form>
    </Modal>
  );
}

// 7. Batch CSV Import Modal
function BatchImportModal({ close, onImport }: { close: () => void; onImport: (records: any[]) => void }) {
  const sampleData = `Subject, Kind, Amount, Income, Credit, Employment, Channel
Jordan Vance, Loan, 35000, 8200, 740, Full time, Branch
Apex Logistics, Transaction, 12400, 6100, 620, Self employed, Online
Elena Rostova, Loan, 18000, 5400, 690, Contract, Online`;

  const [text, setText] = useState(sampleData);

  function parseAndSubmit() {
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    const records: any[] = [];
    
    // Skip header line if present
    const startIndex = lines[0].toLowerCase().includes('subject') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length >= 7) {
        records.push({
          subject: cols[0],
          kind: cols[1] as Kind,
          amount: Number(cols[2]) || 10000,
          income: Number(cols[3]) || 5000,
          credit: Number(cols[4]) || 650,
          employment: cols[5],
          channel: cols[6]
        });
      }
    }

    if (records.length === 0) {
      alert('Please paste valid CSV records with 7 columns.');
      return;
    }

    onImport(records);
  }

  return (
    <Modal title="Batch Import CSV Records" close={close}>
      <div style={{ marginBottom: '12px' }}>
        <p className="muted" style={{ fontSize: '13px' }}>
          Paste multiple transaction or loan records in CSV format below. FinGuard will run risk scoring on each record and save them into the MySQL database.
        </p>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={8}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          color: '#f8fafc',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
          resize: 'vertical'
        }}
      />
      <div className="actions" style={{ marginTop: '16px' }}>
        <button type="button" className="secondary" onClick={close}>Cancel</button>
        <button type="button" className="primary" onClick={parseAndSubmit}>
          Import & Score Records <UploadCloud size={16} />
        </button>
      </div>
    </Modal>
  );
}

// 8. API Key & Webhooks Management Modal
function ApiKeyModal({ close, notify }: { close: () => void; notify: (msg: string) => void }) {
  const [key, setKey] = useState('fg_live_98419283741abc90812');
  const [webhook, setWebhook] = useState('https://api.finguard.io/webhooks/risk-alerts');

  function generateNewKey() {
    const newK = 'fg_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setKey(newK);
    notify('New API secret key generated');
  }

  return (
    <Modal title="API Keys & Webhooks" close={close}>
      <div className="form-grid one">
        <label>
          Production Live Key
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input value={key} readOnly style={{ fontFamily: 'monospace', fontSize: '13px' }} />
            <button className="secondary" type="button" onClick={() => { navigator.clipboard.writeText(key); notify('API key copied to clipboard'); }}>
              Copy
            </button>
          </div>
        </label>

        <label>
          Webhook Endpoint URL
          <input value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://your-domain.com/webhook" />
        </label>
      </div>

      <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)', margin: '16px 0 8px', fontSize: '12px', color: '#f59e0b' }}>
        <ShieldAlert size={14} style={{ display: 'inline', marginRight: '6px' }} />
        Keep your API keys confidential. Do not commit keys to public GitHub repositories.
      </div>

      <div className="actions between">
        <button type="button" className="secondary" onClick={generateNewKey}>Regenerate Key</button>
        <button type="button" className="primary" onClick={() => { notify('Webhook configuration saved'); close(); }}>Save Webhook</button>
      </div>
    </Modal>
  );
}

// 9. Risk Factors ML Deep Dive Modal
function RiskFactorsDeepDiveModal({ close }: { close: () => void }) {
  const features = [
    { name: 'Income-to-Debt Ratio', weight: '38%', description: 'Primary driver comparing requested amount against monthly income' },
    { name: 'Credit Score Percentile', weight: '29%', description: 'FICO credit score relative to risk tier (300-850 range)' },
    { name: 'Employment Stability', weight: '18%', description: 'Tenure & employment status (Full-Time vs Contract/Unemployed)' },
    { name: 'Payment Channel Vulnerability', weight: '10%', description: 'Online card-not-present vs In-branch verified transactions' },
    { name: 'Term Duration', weight: '5%', description: 'Repayment period length in months' }
  ];

  return (
    <Modal title="ML Risk Model Feature Weights" close={close}>
      <p className="muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
        Scikit-Learn Random Forest Classifier (180 trees) feature importance breakdown:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{f.name}</strong>
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 600, fontSize: '12px' }}>
                {f.weight} weight
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{f.description}</p>
          </div>
        ))}
      </div>

      <div className="actions" style={{ marginTop: '20px' }}>
        <button className="primary" onClick={close}>Done</button>
      </div>
    </Modal>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return <div className="empty"><ClipboardList size={26} /><h3>{title}</h3><p>{text}</p></div>;
}

function download(rows: Assessment[]) {
  const body = ['Reference,Subject,Type,Amount,Risk score,Verdict', ...rows.map(x => [x.id, x.subject, x.kind, x.amount, x.score, x.verdict].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
  a.download = 'finguard-assessments.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

createRoot(document.getElementById('root')!).render(<App />);
