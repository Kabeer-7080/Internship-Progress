<<<<<<< HEAD
"use strict";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  Key,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
  WalletCards,
  X,
  Sliders,
  Loader2,
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  BarChart3
} from "lucide-react";
import "./styles.css";
import "./auth.css";
import "./theme.css";
import "./chaos.css";
import "./loader.css";
import { LoadingScreen } from "./LoadingScreen";
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
} from "./api";
import { generateAssessmentPDF } from "./pdfReport";
const seeded = [
  { id: "FG-10482", subject: "Olivia Bennett", kind: "Loan", amount: 28e3, score: 18, verdict: "Approved", created: "Today, 10:42 AM", reason: "Strong income-to-debt ratio", income: 7200, credit: 764, employment: "Full time", channel: "Branch" },
  { id: "FG-10481", subject: "Northline Traders", kind: "Transaction", amount: 9850, score: 72, verdict: "Flagged", created: "Today, 09:18 AM", reason: "Unusual payment velocity", income: 5100, credit: 630, employment: "Self employed", channel: "Online" },
  { id: "FG-10480", subject: "Marcus Chen", kind: "Loan", amount: 14500, score: 34, verdict: "Approved", created: "Yesterday", reason: "Verified employment history", income: 5800, credit: 701, employment: "Full time", channel: "Branch" },
  { id: "FG-10479", subject: "Unknown Merchant", kind: "Transaction", amount: 4200, score: 91, verdict: "Rejected", created: "Yesterday", reason: "High-risk device and location", income: 2100, credit: 520, employment: "Contract", channel: "Online" },
  { id: "FG-10478", subject: "Sofia Ramirez", kind: "Loan", amount: 45e3, score: 48, verdict: "Flagged", created: "Aug 6, 2026", reason: "Short credit history", income: 6800, credit: 656, employment: "Full time", channel: "Branch" }
];
const initialTeam = [
  { id: "tm-1", name: "Kabeer Bhatt", email: "kabeer@finguard.io", role: "Admin", status: "Active" },
  { id: "tm-2", name: "Maya Singh", email: "maya@finguard.io", role: "Analyst", status: "Active" },
  { id: "tm-3", name: "Daniel Reed", email: "daniel@finguard.io", role: "Analyst", status: "Invited" }
];
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const cls = (v) => v.toLowerCase();
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") ?? fallback;
  } catch {
    return fallback;
  }
};
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800 }) {
  const [displayVal, setDisplayVal] = useState(value);
  const prevVal = useRef(value);
  useEffect(() => {
    const startVal = prevVal.current;
    const endVal = value;
    prevVal.current = value;
    if (startVal === endVal) return;
    let startTime = null;
    let frameId;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayVal(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    }
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);
  return <span>{prefix}{new Intl.NumberFormat("en-US").format(displayVal)}{suffix}</span>;
}
function RadialRiskMeter({ score, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score / 100 * circumference;
  const color = score < 40 ? "#05ffa1" : score < 70 ? "#ffb800" : "#ff2a6d";
  const glow = score < 40 ? "rgba(5, 255, 161, 0.45)" : score < 70 ? "rgba(255, 184, 0, 0.45)" : "rgba(255, 42, 109, 0.45)";
  return <div className="radial-meter" style={{ width: size, height: size }}>
      <svg className="radial-meter-svg" width={size} height={size}>
        <circle
    className="radial-meter-bg"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
    fill="transparent"
  />
        <circle
    className="radial-meter-progress"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
    stroke={color}
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    fill="transparent"
    style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
  />
      </svg>
      <div className="radial-meter-inner">
        <span className="radial-score-num" style={{ color }}>{score}</span>
        <span className="radial-score-denom">/ 100</span>
      </div>
    </div>;
}
function MLTelemetryPipeline({ activeStep }) {
  const steps = [
    { title: "Normalizing applicant financial signals & ratios", code: "VEC_01" },
    { title: "Running Credit / Loan Risk Classifier (Random Forest)", code: "CR_02" },
    { title: "Evaluating Behavioral Fraud Signatures & Channel Risk", code: "FR_03" },
    { title: "Estimating Loan Default & Isolation Forest Outliers", code: "DF_04" },
    { title: "Computing SHAP Mathematical Feature Attributions", code: "SHAP_05" }
  ];
  return <div className="telemetry-pipeline">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          <Cpu size={12} style={{ display: "inline", marginRight: "6px" }} /> FINGUARD AI INFERENCE PIPELINE
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>STEP {activeStep} OF 5</span>
      </div>

      {steps.map((s, idx) => {
    const stepNum = idx + 1;
    const isComplete = activeStep > stepNum;
    const isActive = activeStep === stepNum;
    return <div key={idx} className={`telemetry-step ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}>
            <div className="telemetry-indicator">
              {isComplete ? "\u2713" : isActive ? <Loader2 className="spinner" size={10} /> : stepNum}
            </div>
            <span style={{ flex: 1 }}>{s.title}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", opacity: 0.6 }}>{s.code}</span>
          </div>;
  })}
    </div>;
}
function App() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => read("fg-user", null));
  const [token, setToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Overview");
  const [assessments, setAssessments] = useState(() => read("fg-assessments", seeded));
  const [team, setTeam] = useState(() => read("fg-team", initialTeam));
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [notice, setNotice] = useState("");
  const [dbActive, setDbActive] = useState(false);
  const [dbTelemetry, setDbTelemetry] = useState(null);
  const notify = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2800);
  };
  useEffect(() => {
    async function loadBackendData() {
      const health = await checkBackendHealth();
      const online = health.online;
      setDbActive(online);
      if (health.info) {
        setDbTelemetry(health.info);
      }
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
          console.warn("Backend sync warning:", e);
        }
      }
    }
    loadBackendData();
  }, [loggedIn, token]);
  useEffect(() => localStorage.setItem("fg-assessments", JSON.stringify(assessments)), [assessments]);
  useEffect(() => localStorage.setItem("fg-team", JSON.stringify(team)), [team]);
  function handleLogin(tok, userData) {
    setToken(tok);
    setAuthToken(tok);
    setLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem("fg-user", JSON.stringify(userData));
    }
  }
  async function signOut() {
    try {
      await logoutApi();
    } catch (e) {
      console.warn("Logout notice:", e);
    }
    setToken(null);
    setAuthToken(null);
    setLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("fg-user");
    notify("Signed out");
  }
  async function addAssessment(data) {
    let newItem;
    if (dbActive && loggedIn && token) {
      newItem = await createAssessmentApi({
        subject: data.subject,
        kind: data.kind,
        amount: data.amount,
        income: data.income,
        credit_score: data.credit,
        employment: data.employment,
        channel: data.channel
      });
      notify(`ML Engine Scored: ${newItem.verdict} (${newItem.score}/100) \u2014 Saved to DB`);
    } else {
      newItem = localCalculateAssessment(data, assessments.length);
      notify(`ML Model: ${newItem.verdict} (${newItem.score}/100) \u2014 Saved`);
    }
    setAssessments((x) => [newItem, ...x]);
    setModal(null);
    setDetail(newItem);
  }
  async function updateAssessment(id, updatedFields) {
    if (dbActive && loggedIn && token) {
      const updated = await updateAssessmentApi(id, {
        subject: updatedFields.subject,
        income: updatedFields.income,
        amount: updatedFields.amount,
        credit_score: updatedFields.credit,
        employment: updatedFields.employment,
        channel: updatedFields.channel
      });
      setAssessments((x) => x.map((a) => a.id === id ? updated : a));
      setDetail(updated);
      notify(`ML Engine Rescored: ${updated.verdict} (${updated.score}/100)`);
      return;
    }
    setAssessments((x) => x.map((a) => {
      if (a.id !== id) return a;
      const merged = { ...a, ...updatedFields };
      const recalculated = localCalculateAssessment(merged, 0);
      const updated = { ...merged, score: recalculated.score, verdict: recalculated.verdict, reason: recalculated.reason, factors: recalculated.factors };
      setDetail(updated);
      return updated;
    }));
    notify("Assessment updated & rescored");
  }
  async function removeAssessment(id) {
    if (dbActive) {
      try {
        await deleteAssessmentApi(id);
        notify("Assessment deleted from database");
      } catch (e) {
        notify("Assessment deleted");
      }
    } else {
      notify("Assessment deleted");
    }
    setAssessments((x) => x.filter((a) => a.id !== id));
    setDetail(null);
  }
  async function addTeamMember(data) {
    let member;
    if (dbActive) {
      try {
        member = await createTeamMemberApi(data);
        notify("Team member added to database");
      } catch (e) {
        member = { ...data, id: crypto.randomUUID(), status: "Invited" };
        notify("Team member invited");
      }
    } else {
      member = { ...data, id: crypto.randomUUID(), status: "Invited" };
      notify("Invitation created");
    }
    setTeam((x) => [...x, member]);
    setModal(null);
  }
  async function editTeamMember(id, fields) {
    if (dbActive) {
      try {
        const updated = await updateTeamMemberApi(id, fields);
        setTeam((x) => x.map((m) => m.id === id ? updated : m));
        notify("Team member updated in database");
        setEditingMember(null);
        return;
      } catch (e) {
        console.error("Update team error:", e);
      }
    }
    setTeam((x) => x.map((m) => m.id === id ? { ...m, ...fields } : m));
    notify("Team member updated");
    setEditingMember(null);
  }
  async function removeTeamMember(id) {
    if (dbActive) {
      try {
        await deleteTeamMemberApi(id);
        notify("Team member removed from database");
      } catch (e) {
        notify("Team member removed");
      }
    } else {
      notify("Team member removed");
    }
    setTeam((x) => x.filter((m) => m.id !== id));
  }
  async function batchImport(records) {
    let addedCount = 0;
    for (const r of records) {
      const item = localCalculateAssessment(r, assessments.length + addedCount);
      setAssessments((prev) => [item, ...prev]);
      addedCount++;
    }
    setModal(null);
    notify(`Imported ${addedCount} assessment records into database`);
  }
  if (loadingInitial) {
    return <LoadingScreen onComplete={() => setLoadingInitial(false)} />;
  }
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  return <div className="app">
      {
    /* Background Animated Ambient Lighting */
  }
      <div className="ambient-glow top-right" />
      <div className="ambient-glow bottom-left" />

      <Sidebar page={page} setPage={setPage} count={assessments.length} signOut={signOut} dbActive={dbActive} currentUser={currentUser} />

      <main>
        <Header page={page} newAssessment={() => setModal("assessment")} openBatchModal={() => setModal("batch")} openApiKeyModal={() => setModal("apikey")} />
        <div className="page-container" key={page}>
          {page === "Overview" && <Overview items={assessments} open={setDetail} go={setPage} openRiskModal={() => setModal("risk_factors")} />}
          {page === "Assessments" && <Assessments items={assessments} open={setDetail} title="All assessments" openBatchModal={() => setModal("batch")} />}
          {page === "Transactions" && <Assessments items={assessments.filter((x) => x.kind === "Transaction")} open={setDetail} title="Transaction fraud checks" openBatchModal={() => setModal("batch")} />}
          {page === "Team" && <Team team={team} invite={() => setModal("member")} edit={(m) => setEditingMember(m)} remove={removeTeamMember} />}
          {page === "Settings" && <SettingsPage notify={notify} dbActive={dbActive} dbTelemetry={dbTelemetry} currentUser={currentUser} openApiKeyModal={() => setModal("apikey")} />}

        </div>
      </main>

      {
    /* --- ALL SYSTEM MODALS --- */
  }
      {modal === "assessment" && <AssessmentForm close={() => setModal(null)} save={addAssessment} />}
      {modal === "member" && <MemberForm close={() => setModal(null)} save={addTeamMember} />}
      {modal === "batch" && <BatchImportModal close={() => setModal(null)} onImport={batchImport} />}
      {modal === "apikey" && <ApiKeyModal close={() => setModal(null)} notify={notify} />}
      {modal === "risk_factors" && <RiskFactorsDeepDiveModal close={() => setModal(null)} />}
      
      {editingMember && <EditMemberForm member={editingMember} close={() => setEditingMember(null)} save={(fields) => editTeamMember(editingMember.id, fields)} />}
      {detail && <Detail item={detail} close={() => setDetail(null)} remove={removeAssessment} update={updateAssessment} openRiskModal={() => setModal("risk_factors")} />}
      {notice && <div className="toast"><CheckCircle2 size={18} />{notice}</div>}
    </div>;
}
function localCalculateAssessment(data, count) {
  const ratio = data.amount / Math.max(data.income, 1);
  let score = Math.round(64 - (data.credit - 600) * 0.18 + ratio * 7 + (data.employment === "Full time" ? -12 : 7) + (data.kind === "Transaction" && data.channel === "Online" ? 14 : 0));
  score = Math.max(4, Math.min(97, score));
  const verdict = score < 40 ? "Approved" : score < 70 ? "Flagged" : "Rejected";
  const risk_level = score < 40 ? "LOW" : score < 70 ? "MEDIUM" : "HIGH";
  const reason = score < 40 ? "Strong income, credit, and employment signals" : score < 70 ? "Manual review recommended for this risk profile" : "Elevated risk indicators require rejection";
  const isOnline = data.channel === "Online" || data.channel === "Mobile";
  const fraudProb = Math.min(Math.max(0.12 + (ratio > 5 ? 0.35 : 0) + (isOnline ? 0.25 : 0), 0.05), 0.95);
  const fraudStatus = fraudProb < 0.35 ? "CLEAN" : fraudProb < 0.65 ? "SUSPICIOUS" : "HIGH_FRAUD_RISK";
  const rate = 0.08 / 12;
  const term = data.term_months || 36;
  const installment = data.amount * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1);
  const defaultProb = Math.min(Math.max(0.1 + 1.8 * (installment / Math.max(data.income, 1)) - (data.credit - 600) / 250, 0.04), 0.96);
  const isAnomaly = ratio > 7 || data.credit < 500 && data.amount > 3e4;
  const factors = [
    { factor: "Income-to-Debt Ratio", impact: ratio > 5 ? "negative" : "positive", detail: `Requested amount is ${ratio.toFixed(1)}\xD7 monthly income`, shap_value: ratio > 5 ? 0.32 : -0.28, weight_percent: 38 },
    { factor: "Credit Profile", impact: data.credit >= 680 ? "positive" : "negative", detail: `FICO score is ${data.credit} points`, shap_value: data.credit >= 680 ? -0.25 : 0.22, weight_percent: 29 },
    { factor: "Employment Stability", impact: data.employment === "Full time" ? "positive" : "negative", detail: data.employment, shap_value: data.employment === "Full time" ? -0.15 : 0.18, weight_percent: 18 },
    { factor: "Origination Channel", impact: isOnline ? "negative" : "neutral", detail: `${data.channel || "Branch"} channel`, shap_value: isOnline ? 0.12 : 0, weight_percent: 10 },
    { factor: "Loan Term Horizon", impact: term > 36 ? "negative" : "positive", detail: `${term} months term`, shap_value: term > 36 ? 0.08 : -0.05, weight_percent: 5 }
  ];
  return {
    ...data,
    id: data.id || `FG-${10483 + count}`,
    score,
    verdict,
    risk_level,
    reason,
    created: "Just now",
    factors,
    shap_explanation: factors,
    credit_risk: {
      credit_score: score,
      credit_probability: score / 100,
      risk_tier: risk_level,
      verdict
    },
    fraud_detection: {
      fraud_score: Math.round(fraudProb * 100),
      fraud_probability: fraudProb,
      fraud_status: fraudStatus,
      fraud_level: fraudStatus === "CLEAN" ? "LOW" : fraudStatus === "SUSPICIOUS" ? "MEDIUM" : "HIGH",
      signals: [`Channel: ${data.channel || "Branch"}`, `Amount/Income: ${ratio.toFixed(1)}x`]
    },
    default_risk: {
      default_risk_score: Math.round(defaultProb * 100),
      default_probability: defaultProb,
      default_risk_tier: defaultProb < 0.35 ? "LOW" : defaultProb < 0.65 ? "MEDIUM" : "HIGH",
      monthly_installment_est: Math.round(installment),
      debt_burden_ratio: installment / Math.max(data.income, 1)
    },
    anomaly_detection: {
      is_anomaly: isAnomaly,
      anomaly_status: isAnomaly ? "SUSPICIOUS_ACTIVITY" : "NORMAL",
      anomaly_badge: isAnomaly ? "ANOMALY DETECTED" : "CLEAN PROFILE",
      anomaly_score: isAnomaly ? -0.15 : 0.12
    }
  };
}
function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("analyst@finguard.io");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("Analyst");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 4) {
      setError("Use a valid email and a password of at least 4 characters.");
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Enter your full name.");
          setSubmitting(false);
          return;
        }
        res = await registerApi(name, email, password, role);
      } else {
        res = await loginApi(email, password);
      }
      if (res && res.access_token) {
        onLogin(res.access_token, res.user);
      } else {
        setError("Authentication failed. No access token received.");
      }
    } catch (err) {
      setError(err.message || "Authentication error");
    } finally {
      setSubmitting(false);
    }
  }
  function fillDemo(userEmail) {
    setEmail(userEmail);
    setPassword("password");
    setError("");
  }
  return <div className="login">
      <div className="login-card">
        <Brand />
        <p className="eyebrow" style={{ marginTop: "20px" }}>{mode === "login" ? "FINANCIAL INTELLIGENCE" : "WORKSPACE ONBOARDING"}</p>
        <h1>{mode === "login" ? "Sign in to FinGuard" : "Create your workspace"}</h1>
        <p className="muted">{mode === "login" ? "AI-powered risk intelligence platform & loan analyzer" : "Your credentials will be securely persisted."}</p>
        
        <form onSubmit={submit} style={{ marginTop: "24px" }}>
          {mode === "signup" && <div className="form-grid one" style={{ gap: "14px", marginBottom: "14px" }}>
              <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya Chen" /></label>
              <label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option>Analyst</option><option>Admin</option></select></label>
            </div>}
          <div className="form-grid one" style={{ gap: "14px" }}>
            <label>Work email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@company.com" /></label>
            <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" /></label>
          </div>
          
          {error && <div className="form-error"><AlertCircle size={15} /><span>{error}</span></div>}
          
          <button className="primary" style={{ width: "100%", marginTop: "20px" }} disabled={submitting}>
            {submitting ? <Loader2 className="spinner" size={16} /> : mode === "login" ? "Sign in to workspace" : "Create account"} 
            {!submitting && <ArrowUpRight size={16} />}
          </button>
        </form>

        <div className="demo-pills">
          <div className="demo-pill" onClick={() => fillDemo("analyst@finguard.io")}>
            ⚡ Analyst Demo
          </div>
          <div className="demo-pill" onClick={() => fillDemo("admin@finguard.io")}>
            🛡️ Admin Demo
          </div>
        </div>

        <button
    className="link"
    style={{ width: "100%", justifyContent: "center", marginTop: "20px", color: "var(--text-secondary)" }}
    onClick={() => {
      setMode(mode === "login" ? "signup" : "login");
      setError("");
    }}
  >
          {mode === "login" ? "New user? Create an account" : "Already registered? Sign in"}
        </button>
      </div>
    </div>;
}
function Brand() {
  return <div className="brand">
      <div className="brand-icon">
        <ShieldCheck size={20} />
      </div>
      <span className="brand-name">FinGuard</span>
      <span className="brand-tag">AI 2.0</span>
    </div>;
}
function Sidebar({ page, setPage, count, signOut, dbActive, currentUser }) {
  const displayName = currentUser?.name || "Kabeer Bhatt";
  const displayRole = currentUser?.role ? `${currentUser.role} \u2022 Risk Operations` : "Risk Operations Lead";
  const initials = displayName.split(" ").map((n) => n[0]).filter(Boolean).join("").substring(0, 2).toUpperCase() || "KB";
  const links = [
    ["Overview", LayoutDashboard],
    ["Assessments", ClipboardList, String(count)],
    ["Transactions", WalletCards],
    ["Team", Users],
    ["Settings", Settings]
  ];
  return <aside>
      <Brand />
      <div className="workspace">
        <span className="workspace-status" />
        <span>RISK OPERATIONS</span>
      </div>
      <nav>
        {links.map(
    ([name, Icon, count2]) => <button key={name} onClick={() => setPage(name)} className={page === name ? "active" : ""}>
            <Icon size={18} /><span>{name}</span>{count2 && <b>{count2}</b>}
          </button>
  )}
      </nav>
      <div className="aside-bottom">
        <div style={{
    padding: "8px 12px",
    fontSize: "11px",
    borderRadius: "8px",
    background: dbActive ? "rgba(5, 255, 161, 0.12)" : "rgba(255, 184, 0, 0.12)",
    color: dbActive ? "var(--neon-green)" : "var(--neon-amber)",
    border: `1px solid ${dbActive ? "rgba(5, 255, 161, 0.25)" : "rgba(255, 184, 0, 0.25)"}`,
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor" }} />
          <strong>{dbActive ? "FastAPI + MySQL" : "SQLite Local Engine"}</strong>
        </div>
        <div className="profile">
          <div className="profile-avatar">{initials}</div>
          <span><strong>{displayName}</strong><small>{displayRole}</small></span>
        </div>
        <button className="signout" onClick={signOut}><LogOut size={16} /><span>Sign out</span></button>
      </div>
    </aside>;
}
function Header({ page, newAssessment, openBatchModal, openApiKeyModal }) {
  const copy = {
    Overview: "Real-time telemetry and risk distribution matrix",
    Assessments: "Deep-dive into decisions, model vectors, and signals",
    Transactions: "Autonomous payment fraud detection and anomaly surveillance",
    Team: "RBAC permissions and multi-analyst access configuration",
    Settings: "API keys, database telemetry, and webhook configurations"
  };
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const notifRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  return <header>
      <div>
        <p className="eyebrow">RISK OPERATIONS / {page.toUpperCase()}</p>
        <h1>{page === "Overview" ? "Good morning, Kabeer" : page}</h1>
        <p className="muted">{copy[page]}</p>
      </div>
      <div className="header-actions">
        <button className="secondary" title="API Keys & Webhooks" onClick={openApiKeyModal}>
          <Key size={16} /> API Keys
        </button>
        <button className="secondary" title="Batch Upload CSV" onClick={openBatchModal}>
          <UploadCloud size={16} /> Batch Import
        </button>
        <div className="notification-wrap" ref={notifRef}>
          <button className="circle" aria-label="Notifications" onClick={() => setOpen(!open)}>
            <Bell size={18} />{unread > 0 && <i />}
          </button>
          {open && <div className="notification-panel">
              <div className="notification-header">
                <strong>Intelligence Feed ({unread})</strong>
                <button onClick={() => setUnread(0)}>Clear all</button>
              </div>
              <div className="notification-list">
                <article><span className="notice-dot red" /><p><b>High-risk anomaly detected</b><small>Northline Traders (Score 72/100)</small></p></article>
                <article><span className="notice-dot blue" /><p><b>ML Model Inference completed</b><small>Olivia Bennett: Approved (Score 18/100)</small></p></article>
                <article><span className="notice-dot violet" /><p><b>Analyst session initiated</b><small>Daniel Reed connected via OAuth</small></p></article>
                <article><span className="notice-dot green" /><p><b>FastAPI & Scikit-learn ready</b><small>180 Decision trees loaded into RAM</small></p></article>
              </div>
            </div>}
        </div>
        {page !== "Team" && page !== "Settings" && <button className="primary" onClick={newAssessment}>
            <FilePlus2 size={16} /> New assessment
          </button>}
      </div>
    </header>;
}
function Overview({ items, open, go, openRiskModal }) {
  const total = items.length || 1;
  const approved = items.filter((x) => x.verdict === "Approved").length;
  const flagged = items.filter((x) => x.verdict !== "Approved").length;
  const totalAmount = items.reduce((n, x) => n + x.amount, 0);
  return <>
      <section className="metrics">
        <Metric
    icon={<CheckCircle2 size={22} />}
    label="Approval rate"
    valueComponent={<AnimatedNumber value={Math.round(approved / total * 100)} suffix="%" />}
    tone="green"
  />
        <Metric
    icon={<ClipboardList size={22} />}
    label="Total assessments"
    valueComponent={<AnimatedNumber value={items.length} />}
    tone="blue"
  />
        <Metric
    icon={<ShieldAlert size={22} />}
    label="Items needing review"
    valueComponent={<AnimatedNumber value={flagged} />}
    tone="amber"
  />
        <Metric
    icon={<WalletCards size={22} />}
    label="Amount assessed"
    valueComponent={<AnimatedNumber value={totalAmount} prefix="$" />}
    tone="purple"
  />
      </section>

      <section className="grid">
        <div className="panel activity">
          <PanelTitle
    title="Risk Telemetry Activity"
    subtitle="Real-time model volume and classification density (last 7 days)"
    action="View all"
    click={() => go("Assessments")}
  />
          <div className="bars">
            {[42, 58, 47, 72, 64, 88, 76].map((v, i) => <div key={i}>
                <i style={{ height: `${v}%` }} />
                <span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
              </div>)}
          </div>
        </div>

        <div className="panel">
          <div className="split-title" style={{ marginBottom: "8px" }}>
            <h2>Decision Mix</h2>
            <button className="link" onClick={openRiskModal}><Sliders size={14} /> Model Weights</button>
          </div>
          <p className="muted" style={{ marginBottom: "18px", fontSize: "12px" }}>
            Classification distribution across saved assessments
          </p>
          <div className="decision-list">
            <Decision label="Approved (< 40)" value={approved} total={total} color="green" />
            <Decision label="Flagged (40 - 69)" value={items.filter((x) => x.verdict === "Flagged").length} total={total} color="amber" />
            <Decision label="Rejected (>= 70)" value={items.filter((x) => x.verdict === "Rejected").length} total={total} color="red" />
          </div>
        </div>
      </section>

      <section className="panel recent">
        <PanelTitle
    title="Recent AI Assessments"
    subtitle="Click any record to inspect ML risk factors, rescore, or export report"
    action="View all assessments"
    click={() => go("Assessments")}
  />
        <AssessmentTable items={items.slice(0, 5)} open={open} />
      </section>
    </>;
}
function Metric({ icon, label, valueComponent, tone }) {
  return <div className="metric">
      <div className={"metric-icon " + tone}>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{valueComponent}</h2>
        <small style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Sparkles size={11} style={{ color: "var(--neon-cyan)" }} /> Telemetry live
        </small>
      </div>
    </div>;
}
function PanelTitle({ title, subtitle, action, click }) {
  return <div className="panel-title">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action && <button className="link" onClick={click}>
          {action} <ChevronRight size={15} />
        </button>}
    </div>;
}
function Decision({ label, value, total, color }) {
  const pct = Math.round(value / total * 100);
  return <div className="decision-row">
      <span><i className={color} />{label}</span>
      <b>{value} ({pct}%)</b>
      <div>
        <i className={color} style={{ width: `${pct}%` }} />
      </div>
    </div>;
}
function Assessments({ items, open, title, openBatchModal }) {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("All");
  const rows = useMemo(() => items.filter((x) => (verdict === "All" || x.verdict === verdict) && `${x.subject} ${x.id}`.toLowerCase().includes(query.toLowerCase())), [items, query, verdict]);
  return <section className="panel full">
      <PanelTitle title={title} subtitle={`${rows.length} indexed record${rows.length === 1 ? "" : "s"}`} />
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input placeholder="Search applicant, merchant, or ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select value={verdict} onChange={(e) => setVerdict(e.target.value)}>
          <option>All Verdicts</option>
          <option>Approved</option>
          <option>Flagged</option>
          <option>Rejected</option>
        </select>
        <button className="secondary" onClick={openBatchModal}><UploadCloud size={16} />Batch Upload</button>
        <button className="secondary" onClick={() => download(rows)}><ArrowDownToLine size={16} />Export CSV</button>
      </div>
      <AssessmentTable items={rows} open={open} />
      {!rows.length && <div className="empty-state">
          <div className="empty-icon-wrap">
            <ClipboardList size={28} />
          </div>
          <h3>No matching risk records found</h3>
          <p>Try refining your search terms or submit a new loan/transaction assessment.</p>
        </div>}
    </section>;
}
function AssessmentTable({ items, open }) {
  return <div className="table">
      <div className="row headings">
        <span>REFERENCE</span>
        <span>SUBJECT</span>
        <span>TYPE</span>
        <span>AMOUNT</span>
        <span>RISK SCORE</span>
        <span>VERDICT</span>
        <span />
      </div>
      {items.map((x) => <button className="row" key={x.id} onClick={() => open(x)}>
          <span className="ref">{x.id}</span>
          <span><strong>{x.subject}</strong><small>{x.created}</small></span>
          <span><em className={"kind " + x.kind.toLowerCase()}>{x.kind}</em></span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{money(x.amount)}</span>
          <span className="score">
            <i><b className={x.score < 40 ? "green" : x.score < 70 ? "amber" : "red"} style={{ width: `${x.score}%` }} /></i>
            {x.score}
          </span>
          <span><em className={"verdict " + cls(x.verdict)}>{x.verdict}</em></span>
          <ChevronRight size={17} style={{ color: "var(--text-muted)" }} />
        </button>)}
    </div>;
}
function Team({ team, invite, edit, remove }) {
  return <section className="panel full">
      <div className="split-title">
        <div>
          <h2>Risk Operations Team</h2>
          <p className="muted">Manage access roles, security scopes, and active analyst permissions.</p>
        </div>
        <button className="primary" onClick={invite}><Plus size={16} />Invite member</button>
      </div>
      <div className="team-list" style={{ marginTop: "24px" }}>
        {team.map((m) => <div className="member" key={m.id} style={{
    minHeight: "70px",
    borderTop: "1px solid var(--border-subtle)",
    display: "grid",
    gridTemplateColumns: "48px 1fr 110px 100px 120px",
    alignItems: "center",
    padding: "12px 6px"
  }}>
            <div className="member-avatar">{m.name.split(" ").map((x) => x[0]).join("")}</div>
            <div><strong>{m.name}</strong><small>{m.email}</small></div>
            <em className={"role " + m.role.toLowerCase()}>{m.role}</em>
            <em className={"status " + m.status.toLowerCase()}>{m.status}</em>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => edit(m)}>
                <Pencil size={13} /> Edit
              </button>
              <button className="icon-danger" aria-label={`Remove ${m.name}`} onClick={() => remove(m.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>)}
      </div>
    </section>;
}
function SettingsPage({ notify, dbActive, openApiKeyModal, dbTelemetry, currentUser }) {
  const [email, setEmail] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [name, setName] = useState(currentUser?.name || "Kabeer Bhatt");
  return <section className="settings-page" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      <div className="panel settings-card">
        <PanelTitle title="Database Configuration" subtitle="Telemetry engine & storage persistence" />
        <div style={{
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    border: "1px solid var(--border-subtle)",
    margin: "18px 0",
    display: "grid",
    gap: "8px",
    fontSize: "13px"
  }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Engine</span>
            <strong style={{ color: "#fff" }}>
              {dbTelemetry?.database?.active_db_type ? `SQLAlchemy (${dbTelemetry.database.active_db_type})` : "MySQL (SQLAlchemy + PyMySQL)"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Environment</span>
            <strong style={{ color: "#fff" }}>
              {dbTelemetry?.environment ? dbTelemetry.environment.toUpperCase() : "PRODUCTION"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Latency</span>
            <strong style={{ color: "#fff" }}>
              {dbTelemetry?.database?.latency_ms !== void 0 && dbTelemetry?.database?.latency_ms !== null ? `${dbTelemetry.database.latency_ms} ms` : dbActive ? "Connected" : "Offline"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Status</span>
            <strong style={{ color: dbActive ? "var(--neon-green)" : "var(--neon-amber)" }}>
              {dbActive ? dbTelemetry?.database?.is_production_mysql ? "\u25CF Production Cloud MySQL Connected" : "\u25CF Operational (Ready for Cloud MySQL)" : "\u25CF Backend Offline"}
            </strong>
          </div>

        </div>
        <button className="secondary" onClick={openApiKeyModal}><Key size={16} /> Manage API Keys & Webhooks</button>
      </div>

      <div className="panel settings-card">
        <PanelTitle title="Operator Profile" subtitle="Your active analyst credentials" />
        <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
          <label className="form-grid one">
            <span>Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="form-grid one">
            <span>Email address</span>
            <input defaultValue="kabeer@finguard.io" type="email" disabled style={{ opacity: 0.8 }} />
          </label>
        </div>
        <button className="primary" style={{ marginTop: "20px" }} onClick={() => notify("Profile settings saved")}>
          Save changes
        </button>
      </div>

      <div className="panel settings-card" style={{ gridColumn: "1 / -1" }}>
        <PanelTitle title="Automated Risk Alerts" subtitle="Configure notification triggers for anomalous scores" />
        <div style={{ marginTop: "14px" }}>
          <Toggle label="Email assessment summaries upon decision completion" checked={email} change={() => setEmail(!email)} />
          <Toggle label="Real-time alert on high-risk transaction anomalies (Score >= 70)" checked={alerts} change={() => setAlerts(!alerts)} />
        </div>
        <button className="secondary" style={{ marginTop: "18px" }} onClick={() => notify("Notification preferences saved")}>
          Save alert preferences
        </button>
      </div>
    </section>;
}
function Toggle({ label, checked, change }) {
  return <button className="toggle-row" onClick={change}>
      <span>{label}</span>
      <i className={checked ? "on" : ""}><b /></i>
    </button>;
}
function Modal({ title, close, children }) {
  return <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow" style={{ color: "var(--neon-cyan)", letterSpacing: "1.5px" }}>FINGUARD RISK ENGINE</p>
            <h2>{title}</h2>
          </div>
          <button className="circle" onClick={close} aria-label="Close"><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>;
}
function AssessmentForm({ close, save }) {
  const [kind, setKind] = useState("Loan");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(1);
    const timer1 = setTimeout(() => setStep(2), 250);
    const timer2 = setTimeout(() => setStep(3), 500);
    const timer3 = setTimeout(() => setStep(4), 850);
    const timer4 = setTimeout(() => setStep(5), 1100);
    const f = new FormData(e.currentTarget);
    try {
      await save({
        subject: String(f.get("subject")),
        kind,
        amount: Number(f.get("amount")),
        income: Number(f.get("income")),
        credit: Number(f.get("credit")),
        employment: String(f.get("employment")),
        channel: String(f.get("channel"))
      });
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setError(err?.message || "Assessment failed. Please check backend connection.");
      setLoading(false);
    }
  }
  return <Modal title="New Risk Assessment" close={close}>
      <form onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={kind === "Loan" ? "selected" : ""} onClick={() => setKind("Loan")} disabled={loading}>Loan Application</button>
          <button type="button" className={kind === "Transaction" ? "selected" : ""} onClick={() => setKind("Transaction")} disabled={loading}>Fraud Check</button>
        </div>

        <div className="form-grid">
          <label>{kind === "Loan" ? "Applicant name" : "Merchant / account name"}<input name="subject" required placeholder="e.g. Jordan Taylor" disabled={loading} /></label>
          <label>{kind === "Loan" ? "Monthly income" : "Available balance"}<input name="income" required min="1" type="number" placeholder="5000" disabled={loading} /></label>
          <label>{kind === "Loan" ? "Loan amount" : "Transaction amount"}<input name="amount" required min="1" type="number" placeholder="25000" disabled={loading} /></label>
          <label>Credit score<input name="credit" required type="number" min="300" max="850" defaultValue="680" disabled={loading} /></label>
          <label>Employment<select name="employment" disabled={loading}><option>Full time</option><option>Self employed</option><option>Contract</option><option>Unemployed</option></select></label>
          <label>Channel<select name="channel" disabled={loading}><option>{kind === "Loan" ? "Branch" : "Online"}</option><option>Mobile</option><option>In person</option></select></label>
        </div>

        {loading && <MLTelemetryPipeline activeStep={step} />}

        {error && <div className="form-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>}

        <div className="model-note">
          <ShieldCheck size={18} /> 
          <span>Scikit-learn Random Forest model will evaluate vectors and store the record in database.</span>
        </div>

        <div className="actions">
          <button type="button" className="secondary" onClick={close} disabled={loading}>Cancel</button>
          <button className="primary" disabled={loading}>
            {loading ? <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader2 className="spinner" size={16} /> Analyzing with ML Engine...
              </span> : <>Run risk assessment <ArrowUpRight size={16} /></>}
          </button>
        </div>
      </form>
    </Modal>;
}
function MemberForm({ close, save }) {
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({ name: String(f.get("name")), email: String(f.get("email")), role: f.get("role") });
  }
  return <Modal title="Invite Team Member" close={close}>
      <form onSubmit={submit}>
        <div className="form-grid one" style={{ gap: "14px" }}>
          <label>Full name<input name="name" required placeholder="e.g. Priya Sharma" /></label>
          <label>Work email<input name="email" required type="email" placeholder="priya@finguard.io" /></label>
          <label>Role<select name="role"><option>Analyst</option><option>Admin</option></select></label>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary">Create invitation <ArrowUpRight size={16} /></button>
        </div>
      </form>
    </Modal>;
}
function EditMemberForm({ member, close, save }) {
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      name: String(f.get("name")),
      role: f.get("role"),
      status: f.get("status")
    });
  }
  return <Modal title={`Edit ${member.name}`} close={close}>
      <form onSubmit={submit}>
        <div className="form-grid one" style={{ gap: "14px" }}>
          <label>Full name<input name="name" defaultValue={member.name} required /></label>
          <label>Work email<input name="email" defaultValue={member.email} disabled style={{ opacity: 0.7 }} /></label>
          <label>Role<select name="role" defaultValue={member.role}><option>Analyst</option><option>Admin</option></select></label>
          <label>Status<select name="status" defaultValue={member.status}><option>Active</option><option>Invited</option><option>Suspended</option></select></label>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary">Save changes <ArrowUpRight size={16} /></button>
        </div>
      </form>
    </Modal>;
}
function Detail({ item, close, remove, update, openRiskModal }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <EditAssessment item={item} close={() => setEditing(false)} onSave={async (fields) => {
    await update(item.id, fields);
    setEditing(false);
  }} />;
  const creditRisk = item.credit_risk || { credit_score: item.score, risk_tier: item.risk_level || "MEDIUM", verdict: item.verdict };
  const fraud = item.fraud_detection || { fraud_score: item.kind === "Transaction" && item.channel === "Online" ? 62 : 18, fraud_status: item.kind === "Transaction" && item.channel === "Online" ? "SUSPICIOUS" : "CLEAN", fraud_level: "LOW", signals: [] };
  const defaultRisk = item.default_risk || { default_risk_score: Math.min(item.score + 5, 95), default_risk_tier: item.score > 60 ? "HIGH" : item.score > 35 ? "MEDIUM" : "LOW", default_probability: item.score / 100 };
  const anomaly = item.anomaly_detection || { is_anomaly: item.score > 75, anomaly_status: item.score > 75 ? "SUSPICIOUS_ACTIVITY" : "NORMAL", anomaly_badge: item.score > 75 ? "ANOMALY DETECTED" : "CLEAN PROFILE" };
  const shapFactors = item.shap_explanation || item.factors || [];
  return <Modal title={item.subject} close={close}>
      <div className="detail-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <RadialRiskMeter score={item.score} size={96} strokeWidth={8} />
          <div>
            <p className="eyebrow" style={{ color: "var(--neon-cyan)", marginBottom: "4px" }}>COMPOSITE AI RISK ENGINE</p>
            <h2 style={{ fontSize: "24px", fontWeight: 800 }}>{item.verdict}</h2>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Overall Risk Score: {item.score}/100 • Risk Tier: <strong style={{ color: "#fff" }}>{item.risk_level || "MEDIUM"}</strong>
            </span>
          </div>
        </div>
        <em className={"verdict " + cls(item.verdict)} style={{ fontSize: "13px", padding: "6px 14px" }}>{item.verdict}</em>
      </div>

      {
    /* Multi-Model Sub-Engine Grid */
  }
      <div className="ai-multi-grid">
        <div className="ai-card">
          <span className="ai-card-title"><Layers size={13} color="var(--neon-cyan)" /> Credit Risk</span>
          <div className="ai-card-val">
            <span>{creditRisk.credit_score}</span>
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</small>
          </div>
          <span className={`ai-badge ${creditRisk.risk_tier.toLowerCase()}`}>{creditRisk.risk_tier} RISK</span>
        </div>

        <div className="ai-card">
          <span className="ai-card-title"><ShieldAlert size={13} color="var(--neon-amber)" /> Fraud Status</span>
          <div className="ai-card-val">
            <span>{fraud.fraud_score}</span>
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>% prob</small>
          </div>
          <span className={`ai-badge ${fraud.fraud_status.toLowerCase()}`}>{fraud.fraud_status.replace("_", " ")}</span>
        </div>

        <div className="ai-card">
          <span className="ai-card-title"><BarChart3 size={13} color="var(--neon-magenta)" /> Default Risk</span>
          <div className="ai-card-val">
            <span>{defaultRisk.default_risk_score}</span>
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</small>
          </div>
          <span className={`ai-badge ${defaultRisk.default_risk_tier.toLowerCase()}`}>{defaultRisk.default_risk_tier} RISK</span>
        </div>

        <div className="ai-card">
          <span className="ai-card-title"><Cpu size={13} color="var(--neon-green)" /> Isolation Forest</span>
          <div className="ai-card-val">
            <span style={{ fontSize: "13px" }}>{anomaly.is_anomaly ? "Outlier" : "Inlier"}</span>
          </div>
          <span className={`ai-badge ${anomaly.anomaly_status.toLowerCase()}`}>{anomaly.anomaly_status === "NORMAL" ? "NORMAL" : "ANOMALOUS"}</span>
        </div>
      </div>

      <div style={{ marginTop: "16px", marginBottom: "8px" }}>
        <p className="eyebrow" style={{ color: "var(--text-muted)" }}>DECISION EXPLANATION</p>
      </div>
      <div className="explanation">
        <ShieldCheck size={20} />
        <div>
          <strong>{item.reason}</strong>
          <span>Synthesized from Random Forest underwriting, fraud heuristics, calibrated default modeling, and Isolation Forest outliers.</span>
        </div>
      </div>

      {shapFactors.length > 0 && <>
          <div className="split-title" style={{ marginTop: "20px", marginBottom: "10px" }}>
            <p className="eyebrow" style={{ color: "var(--neon-cyan)", letterSpacing: "1px" }}>
              <Sparkles size={12} style={{ display: "inline", marginRight: "6px" }} /> EXPLAINABLE AI — SHAP FEATURE ATTRIBUTION
            </p>
            <button className="link" onClick={openRiskModal}><Sliders size={13} /> Feature Weights</button>
          </div>
          <div className="shap-container">
            {shapFactors.map((f, i) => {
    const weight = f.weight_percent || Math.max(10, Math.round(35 - i * 6));
    const isPositive = f.impact === "positive";
    const isNegative = f.impact === "negative";
    return <div key={i} className="shap-row">
                  <div className="shap-header">
                    <span style={{ fontWeight: 700, color: "#fff" }}>{f.factor}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: isPositive ? "var(--neon-green)" : isNegative ? "var(--neon-magenta)" : "var(--text-muted)" }}>
                      {f.shap_value !== void 0 ? `SHAP: ${f.shap_value > 0 ? "+" : ""}${f.shap_value.toFixed(3)}` : `${weight}% Weight`} • {isPositive ? "Reduces Risk" : isNegative ? "Increases Risk" : "Neutral"}
                    </span>
                  </div>
                  <div className="shap-track">
                    <div
      className={`shap-bar ${f.impact}`}
      style={{ width: `${Math.min(Math.max(weight * 2.2, 12), 100)}%` }}
    />
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>{f.detail}</p>
                </div>;
  })}
          </div>
        </>}


      <div style={{ marginTop: "20px", marginBottom: "8px" }}>
        <p className="eyebrow" style={{ color: "var(--text-muted)" }}>APPLICATION DATA</p>
      </div>
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

      <div className="actions between" style={{ marginTop: "28px" }}>
        <button className="danger" onClick={() => remove(item.id)}><Trash2 size={16} />Delete record</button>
        <span style={{ display: "flex", gap: "10px" }}>
          <button className="secondary" onClick={() => generateAssessmentPDF(item)}><ArrowDownToLine size={16} />Export PDF</button>
          <button className="secondary" onClick={() => setEditing(true)}><Pencil size={16} />Edit & Rescore</button>
          <button className="primary" onClick={close}>Done</button>
        </span>
      </div>
    </Modal>;
}
function EditAssessment({ item, close, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      await onSave({
        subject: String(f.get("subject")),
        income: Number(f.get("income")),
        amount: Number(f.get("amount")),
        credit: Number(f.get("credit")),
        employment: String(f.get("employment")),
        channel: String(f.get("channel"))
      });
    } catch (err) {
      setError(err?.message || "Failed to update and rescore assessment.");
      setLoading(false);
    }
  }
  return <Modal title={`Edit & Rescore ${item.id}`} close={close}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Subject<input name="subject" defaultValue={item.subject} required disabled={loading} /></label>
          <label>Income / balance<input name="income" defaultValue={item.income} required min="1" type="number" disabled={loading} /></label>
          <label>Amount<input name="amount" defaultValue={item.amount} required min="1" type="number" disabled={loading} /></label>
          <label>Credit score<input name="credit" defaultValue={item.credit} required type="number" min="300" max="850" disabled={loading} /></label>
          <label>Employment<select name="employment" defaultValue={item.employment} disabled={loading}><option>Full time</option><option>Self employed</option><option>Contract</option><option>Unemployed</option></select></label>
          <label>Channel<select name="channel" defaultValue={item.channel} disabled={loading}><option>Branch</option><option>Online</option><option>Mobile</option><option>In person</option></select></label>
        </div>
        {error && <div className="form-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>}
        <div className="actions">
          <button type="button" className="secondary" onClick={close} disabled={loading}>Cancel</button>
          <button className="primary" disabled={loading}>
            {loading ? <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader2 className="spinner" size={16} /> Re-scoring with ML Engine...
              </span> : <>Save and rescore <ArrowUpRight size={16} /></>}
          </button>
        </div>
      </form>
    </Modal>;
}
function BatchImportModal({ close, onImport }) {
  const sampleData = `Subject, Kind, Amount, Income, Credit, Employment, Channel
Jordan Vance, Loan, 35000, 8200, 740, Full time, Branch
Apex Logistics, Transaction, 12400, 6100, 620, Self employed, Online
Elena Rostova, Loan, 18000, 5400, 690, Contract, Online`;
  const [text, setText] = useState(sampleData);
  function parseAndSubmit() {
    const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);
    const records = [];
    const startIndex = lines[0].toLowerCase().includes("subject") ? 1 : 0;
    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length >= 7) {
        records.push({
          subject: cols[0],
          kind: cols[1],
          amount: Number(cols[2]) || 1e4,
          income: Number(cols[3]) || 5e3,
          credit: Number(cols[4]) || 650,
          employment: cols[5],
          channel: cols[6]
        });
      }
    }
    if (records.length === 0) {
      alert("Please paste valid CSV records with 7 columns.");
      return;
    }
    onImport(records);
  }
  return <Modal title="Batch Import CSV Records" close={close}>
      <p className="muted" style={{ fontSize: "13px", marginBottom: "14px" }}>
        Paste raw tabular loan/transaction data. FinGuard will execute vectorized inference on every row and save to the database.
      </p>
      <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    rows={8}
    style={{
      width: "100%",
      background: "rgba(0,0,0,0.35)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "10px",
      color: "#f8fafc",
      padding: "14px",
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      resize: "vertical",
      outline: "none"
    }}
  />
      <div className="actions" style={{ marginTop: "18px" }}>
        <button type="button" className="secondary" onClick={close}>Cancel</button>
        <button type="button" className="primary" onClick={parseAndSubmit}>
          Import & Score Records <UploadCloud size={16} />
        </button>
      </div>
    </Modal>;
}
function ApiKeyModal({ close, notify }) {
  const [key, setKey] = useState("fg_live_98419283741abc90812");
  const [webhook, setWebhook] = useState("https://api.finguard.io/webhooks/risk-alerts");
  function generateNewKey() {
    const newK = "fg_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setKey(newK);
    notify("New API secret key generated");
  }
  return <Modal title="API Keys & Webhooks" close={close}>
      <div className="form-grid one" style={{ gap: "16px" }}>
        <label>
          Production Live Key
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input value={key} readOnly style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }} />
            <button className="secondary" type="button" onClick={() => {
    navigator.clipboard.writeText(key);
    notify("API key copied to clipboard");
  }}>
              Copy
            </button>
          </div>
        </label>

        <label>
          Webhook Endpoint URL
          <input value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="https://your-domain.com/webhook" />
        </label>
      </div>

      <div style={{ padding: "14px", background: "rgba(255, 184, 0, 0.08)", borderRadius: "10px", border: "1px solid rgba(255, 184, 0, 0.25)", margin: "18px 0 8px", fontSize: "12px", color: "var(--neon-amber)" }}>
        <ShieldAlert size={15} style={{ display: "inline", marginRight: "8px" }} />
        Keep your API keys confidential. Do not commit keys to public GitHub repositories.
      </div>

      <div className="actions between">
        <button type="button" className="secondary" onClick={generateNewKey}>Regenerate Key</button>
        <button type="button" className="primary" onClick={() => {
    notify("Webhook configuration saved");
    close();
  }}>Save Webhook</button>
      </div>
    </Modal>;
}
function RiskFactorsDeepDiveModal({ close }) {
  const features = [
    { name: "Income-to-Debt Ratio", weight: "38%", description: "Primary driver comparing requested amount against monthly income" },
    { name: "Credit Score Percentile", weight: "29%", description: "FICO credit score relative to risk tier (300-850 range)" },
    { name: "Employment Stability", weight: "18%", description: "Tenure & employment status (Full-Time vs Contract/Unemployed)" },
    { name: "Payment Channel Vulnerability", weight: "10%", description: "Online card-not-present vs In-branch verified transactions" },
    { name: "Term Duration", weight: "5%", description: "Repayment period length in months" }
  ];
  return <Modal title="ML Risk Model Feature Weights" close={close}>
      <p className="muted" style={{ fontSize: "13px", marginBottom: "18px" }}>
        Scikit-Learn Random Forest Classifier (180 trees) feature importance breakdown:
      </p>

      <div style={{ display: "grid", gap: "12px" }}>
        {features.map((f, i) => <div key={i} style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ color: "#fff", fontSize: "14px" }}>{f.name}</strong>
              <span style={{ padding: "3px 10px", borderRadius: "6px", background: "rgba(0, 240, 255, 0.15)", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px" }}>
                {f.weight} weight
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{f.description}</p>
          </div>)}
      </div>

      <div className="actions" style={{ marginTop: "24px" }}>
        <button className="primary" onClick={close}>Done</button>
      </div>
    </Modal>;
}
function download(rows) {
  const body = ["Reference,Subject,Type,Amount,Risk score,Verdict", ...rows.map((x) => [x.id, x.subject, x.kind, x.amount, x.score, x.verdict].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = "finguard-assessments.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
export { App };
export default App;
=======
import React, { useEffect, useState } from "react";
import "./style.css";

const API_STUDENTS = "http://127.0.0.1:5000/api/students";
const API_PREDICT = "http://127.0.0.1:5000/api/predict";

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ML Prediction State
  const [mlForm, setMlForm] = useState({ study_hours: "6", attendance: "85" });
  const [prediction, setPrediction] = useState(null);
  const [mlError, setMlError] = useState("");
  const [mlLoading, setMlLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setError("");
      const res = await fetch(API_STUDENTS);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      const list = Array.isArray(data) ? data : (Array.isArray(data?.students) ? data.students : []);
      setStudents(list);
    } catch (e) {
      setError(e.message);
      setStudents([]);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(API_STUDENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage("Student created successfully.");
      setForm({ name: "", email: "", course: "" });
      loadStudents();
    } catch (e) {
      setError(e.message);
    }
  };

  const predictSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setMlError("");
    setMlLoading(true);

    try {
      const payload = {
        study_hours: mlForm.study_hours === "" ? "" : (isNaN(mlForm.study_hours) ? mlForm.study_hours : Number(mlForm.study_hours)),
        attendance: mlForm.attendance === "" ? "" : (isNaN(mlForm.attendance) ? mlForm.attendance : Number(mlForm.attendance))
      };

      const res = await fetch(API_PREDICT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Prediction request failed");
      }
      setPrediction(data.prediction);
    } catch (e) {
      setMlError(e.message);
    } finally {
      setMlLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Student Management & ML Analytics</h1>
        <p>Day 46 — Machine Learning Model Integration</p>
      </header>

      {/* ML Prediction Card */}
      <section className="card ml-card">
        <div className="card-header-icon">
          <h2>🤖 ML Performance Predictor</h2>
          <span className="subtitle-tag">Logistic Regression Model</span>
        </div>
        <form onSubmit={predictSubmit} className="form-grid ml-form">
          <div className="input-group">
            <label htmlFor="study-hours-input">Study Hours / Day (0 - 24)</label>
            <input
              id="study-hours-input"
              type="text"
              placeholder="e.g. 6"
              value={mlForm.study_hours}
              onChange={e => setMlForm({ ...mlForm, study_hours: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="attendance-input">Attendance % (0 - 100)</label>
            <input
              id="attendance-input"
              type="text"
              placeholder="e.g. 85"
              value={mlForm.attendance}
              onChange={e => setMlForm({ ...mlForm, attendance: e.target.value })}
            />
          </div>
          <div className="input-group button-group">
            <label>&nbsp;</label>
            <button type="submit" disabled={mlLoading}>
              {mlLoading ? "Predicting..." : "Predict"}
            </button>
          </div>
        </form>

        {prediction && (
          <div className={`prediction-result ${prediction.toLowerCase()}`}>
            <span>Prediction Result:</span>
            <strong className="prediction-badge">{prediction}</strong>
          </div>
        )}

        {mlError && <div className="error">{mlError}</div>}
      </section>

      {/* Add Student Card */}
      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={submit} className="form-grid add-form">
          <div className="input-group">
            <label htmlFor="student-name">Full Name</label>
            <input
              id="student-name"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="student-email">Email Address</label>
            <input
              id="student-email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="student-course">Course Name</label>
            <input
              id="student-course"
              placeholder="Course"
              value={form.course}
              onChange={e => setForm({ ...form, course: e.target.value })}
            />
          </div>
          <div className="input-group button-group">
            <label>&nbsp;</label>
            <button type="submit">Add Student</button>
          </div>
        </form>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </section>

      {/* Student List Card */}
      <section className="card">
        <div className="title-row">
          <h2>Students</h2>
          <button onClick={loadStudents}>Refresh</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Course</th></tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.map(s => (
              <tr key={s.id}>
                <td><strong>#{s.id}</strong></td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td><span className="badge">{s.course}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!Array.isArray(students) || !students.length) && <p className="muted">No students found.</p>}
      </section>
    </main>
  );
}
>>>>>>> 6d00188e9a1023735b8a035c1e127afbc71f5eca
