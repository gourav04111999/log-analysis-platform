import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0e1a", panel: "#0f1526", border: "#1e2d4a",
  accent: "#00e5ff", green: "#00ff88", warn: "#ffb300",
  danger: "#ff3b5c", muted: "#3a4d6b", text: "#c8d8f0", dim: "#5a7499",
};

const SERVICES = ["auth-service","api-gateway","db-connector","etl-pipeline","audit-logger"];
const LEVELS   = ["INFO","WARN","ERROR","DEBUG"];
const LEVEL_W  = [0.6, 0.2, 0.1, 0.1];
const MESSAGES = {
  INFO:  ["User login successful","ETL job completed","DB connection established","Data ingested: 1240 rows","Query executed in 42ms","Audit record written","Session token refreshed","Batch processed: 980 records"],
  WARN:  ["High memory usage detected (82%)","Slow query: 1.8s","Retry #2 for DB connection","Rate limit approaching","Certificate expiry in 14 days"],
  ERROR: ["DB connection timeout","ETL pipeline failed: null pointer","Authentication rejected","Schema mismatch on ingest","Critical: disk I/O error"],
  DEBUG: ["Query plan evaluated","Cache miss for key usr:9021","Heartbeat OK","Token validated","Index scan on logs_2025"],
};

let logIdCounter = 1;
function makeLog() {
  const r = Math.random();
  let acc = 0, lvl = "INFO";
  for (let i = 0; i < LEVELS.length; i++) { acc += LEVEL_W[i]; if (r < acc) { lvl = LEVELS[i]; break; } }
  const svc  = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const msgs = MESSAGES[lvl];
  const msg  = msgs[Math.floor(Math.random() * msgs.length)];
  const now  = new Date();
  return {
    id: logIdCounter++, ts: now.toISOString(),
    tsDisp: now.toLocaleTimeString("en-IN", { hour12: false }),
    level: lvl, service: svc, message: msg,
    traceId: Math.random().toString(36).slice(2, 10).toUpperCase(),
  };
}

const gs = {
  root: { fontFamily: "'IBM Plex Mono','Fira Code',monospace", background: COLORS.bg, color: COLORS.text, minHeight: "100vh", display: "flex", flexDirection: "column", fontSize: 13 },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel },
  logo: { display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, color: COLORS.accent, letterSpacing: 1 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 8px ${COLORS.green}`, animation: "pulse 2s infinite" },
  tabs: { display: "flex", gap: 2 },
  tab: (a) => ({ padding: "6px 18px", cursor: "pointer", borderRadius: 4, background: a ? COLORS.accent : "transparent", color: a ? COLORS.bg : COLORS.dim, fontWeight: a ? 700 : 400, fontSize: 12, border: "none", letterSpacing: 0.5, transition: "all 0.2s" }),
  badge: (color) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1px 7px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: color + "22", color, border: `1px solid ${color}44` }),
  card: { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 10, color: COLORS.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  bigNum: { fontSize: 28, fontWeight: 700, color: COLORS.accent, lineHeight: 1 },
  scrollBox: { overflowY: "auto", flex: 1, scrollbarWidth: "thin", scrollbarColor: `${COLORS.muted} transparent` },
  input: { background: "#060b14", border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontFamily: "inherit", fontSize: 13, padding: "10px 14px", width: "100%", outline: "none" },
  btn: (col = COLORS.accent) => ({ background: col + "18", border: `1px solid ${col}55`, color: col, borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, transition: "all 0.2s", whiteSpace: "nowrap" }),
  sectionHead: { fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6 },
};

function lvlColor(l) { return { INFO: COLORS.green, WARN: COLORS.warn, ERROR: COLORS.danger, DEBUG: COLORS.dim }[l] || COLORS.text; }

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1), w = 100, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} /></svg>;
}

function StatCard({ label, value, color = COLORS.accent, spark }) {
  return (
    <div style={gs.card}>
      <div style={gs.label}>{label}</div>
      <div style={{ ...gs.bigNum, color }}>{value}</div>
      {spark && <div style={{ marginTop: 8 }}><Sparkline data={spark} color={color} /></div>}
    </div>
  );
}

function LogRow({ log, selected, onClick }) {
  const c = lvlColor(log.level);
  return (
    <div onClick={() => onClick(log)} style={{ display: "grid", gridTemplateColumns: "80px 55px 120px 1fr 90px", gap: 8, alignItems: "center", padding: "5px 10px", cursor: "pointer", borderRadius: 4, background: selected ? COLORS.accent + "10" : "transparent", borderLeft: selected ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>
      <span style={{ color: COLORS.dim, fontSize: 11 }}>{log.tsDisp}</span>
      <span style={{ ...gs.badge(c), fontSize: 9 }}>{log.level}</span>
      <span style={{ color: COLORS.muted + "cc", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.service}</span>
      <span style={{ color: COLORS.text, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message}</span>
      <span style={{ color: COLORS.dim, fontSize: 10, textAlign: "right" }}>{log.traceId}</span>
    </div>
  );
}

function LogDetail({ log }) {
  if (!log) return <div style={{ color: COLORS.dim, fontSize: 12, marginTop: 20, textAlign: "center" }}>Select a log entry to inspect</div>;
  const c = lvlColor(log.level);
  return (
    <div>
      <div style={gs.sectionHead}>Log Detail</div>
      {[["Timestamp", log.ts], ["Level", log.level], ["Service", log.service], ["Message", log.message], ["Trace ID", log.traceId]].map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={gs.label}>{k}</div>
          <div style={{ color: k === "Level" ? c : COLORS.text, fontSize: 12, wordBreak: "break-all" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function NLQueryPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const examples = ["Show all ERROR logs from auth-service","Count WARN events grouped by service","Find logs with slow query messages","List all ETL pipeline failures"];

  async function runQuery(q) {
    if (!q.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `You are a SQL expert. Table: logs. Columns: id, ts (TIMESTAMP), level (INFO/WARN/ERROR/DEBUG), service, message, trace_id, source. Convert: "${q}". Return ONLY JSON with keys "sql" and "explanation".` }],
        }),
      });
      const data = await res.json();
      const txt = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setHistory(h => [{ query: q, ...parsed }, ...h.slice(0, 4)]);
    } catch { setResult({ sql: "-- Error generating SQL", explanation: "Failed to contact AI." }); }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={gs.sectionHead}>Natural Language to SQL</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {examples.map(e => <button key={e} onClick={() => setQuery(e)} style={{ ...gs.btn(COLORS.muted), fontSize: 10, padding: "4px 10px" }}>{e}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input style={gs.input} placeholder="Ask in plain English..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runQuery(query)} />
        <button style={gs.btn(COLORS.accent)} onClick={() => runQuery(query)} disabled={loading}>{loading ? "..." : "RUN"}</button>
      </div>
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...gs.card, borderColor: COLORS.accent + "44" }}>
            <div style={gs.label}>Generated SQL</div>
            <pre style={{ color: COLORS.accent, fontSize: 12, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>{result.sql}</pre>
          </div>
          <div style={gs.card}>
            <div style={gs.label}>Explanation</div>
            <div style={{ color: COLORS.text, fontSize: 12 }}>{result.explanation}</div>
          </div>
        </div>
      )}
      {history.length > 0 && (
        <div>
          <div style={gs.sectionHead}>Query History</div>
          {history.map((h, i) => (
            <div key={i} style={{ ...gs.card, marginBottom: 8, cursor: "pointer" }} onClick={() => setQuery(h.query)}>
              <div style={{ color: COLORS.dim, fontSize: 10, marginBottom: 4 }}>"{h.query}"</div>
              <pre style={{ color: COLORS.muted + "cc", fontSize: 10, margin: 0, whiteSpace: "pre-wrap" }}>{h.sql}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIInsightsPanel({ logs }) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);

  async function analyze() {
    setLoading(true); setInsight(null);
    const sample = logs.slice(-40).map(l => `[${l.level}] ${l.service}: ${l.message}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Analyze these logs and return ONLY JSON with keys: "summary", "anomalies" (array), "recommendations" (array), "health_score" (0-100), "critical_services" (array).\n\nLogs:\n${sample}` }],
        }),
      });
      const data = await res.json();
      const txt = data.content?.find(b => b.type === "text")?.text || "{}";
      setInsight(JSON.parse(txt.replace(/```json|```/g, "").trim()));
    } catch { setInsight({ summary: "Analysis failed.", anomalies: [], recommendations: [], health_score: 0, critical_services: [] }); }
    setLoading(false);
  }

  const scoreColor = (s) => s >= 75 ? COLORS.green : s >= 50 ? COLORS.warn : COLORS.danger;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={gs.sectionHead}>AI Log Insights</div>
      <button style={{ ...gs.btn(COLORS.green), alignSelf: "flex-start" }} onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze Recent Logs"}</button>
      {insight && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...gs.card, display: "flex", alignItems: "center", gap: 20 }}>
            <div>
              <div style={gs.label}>Health Score</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: scoreColor(insight.health_score), lineHeight: 1 }}>{insight.health_score}<span style={{ fontSize: 16 }}>/100</span></div>
            </div>
            <div style={{ flex: 1, color: COLORS.text, fontSize: 12 }}>{insight.summary}</div>
          </div>
          <div style={gs.grid2}>
            <div style={gs.card}>
              <div style={gs.label}>Anomalies Detected</div>
              {insight.anomalies?.map((a, i) => <div key={i} style={{ fontSize: 12, color: COLORS.warn, marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid ${COLORS.warn}` }}>{a}</div>)}
            </div>
            <div style={gs.card}>
              <div style={gs.label}>Recommendations</div>
              {insight.recommendations?.map((r, i) => <div key={i} style={{ fontSize: 12, color: COLORS.green, marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid ${COLORS.green}` }}>{r}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompliancePanel({ logs }) {
  const errCount  = logs.filter(l => l.level === "ERROR").length;
  const warnCount = logs.filter(l => l.level === "WARN").length;
  const auditLogs = logs.filter(l => l.service === "audit-logger");
  const rules = [
    { id: "AUD-001", name: "Audit Trail Completeness",    status: auditLogs.length > 2 ? "PASS" : "WARN",  detail: `${auditLogs.length} audit entries` },
    { id: "AUD-002", name: "Error Rate Threshold (<12%)", status: (errCount / Math.max(logs.length,1)) < 0.12 ? "PASS" : "FAIL", detail: `${errCount} errors` },
    { id: "AUD-003", name: "Authentication Monitoring",   status: "PASS", detail: "Login events tracked" },
    { id: "AUD-004", name: "Data Ingestion Logging",      status: "PASS", detail: "ETL events captured" },
    { id: "AUD-005", name: "Warning Level Monitoring",    status: warnCount < 15 ? "PASS" : "WARN", detail: `${warnCount} warnings` },
    { id: "AUD-006", name: "Trace ID Coverage",           status: "PASS", detail: "100% coverage" },
  ];
  const col = (s) => ({ PASS: COLORS.green, WARN: COLORS.warn, FAIL: COLORS.danger })[s];
  return (
    <div>
      <div style={gs.sectionHead}>Compliance and Audit</div>
      <div style={{ ...gs.grid4, marginBottom: 16 }}>
        <StatCard label="Total Events"  value={logs.length}       color={COLORS.accent} />
        <StatCard label="Audit Entries" value={auditLogs.length}  color={COLORS.green} />
        <StatCard label="Errors"        value={errCount}          color={COLORS.danger} />
        <StatCard label="Warnings"      value={warnCount}         color={COLORS.warn} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rules.map(r => (
          <div key={r.id} style={{ ...gs.card, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
            <span style={gs.badge(col(r.status))}>{r.status}</span>
            <span style={{ color: COLORS.dim, fontSize: 10, width: 70 }}>{r.id}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{r.name}</span>
            <span style={{ color: COLORS.dim, fontSize: 11 }}>{r.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ETLPanel() {
  const jobs = [
    { name: "DB to Data Warehouse Sync",    status: "RUNNING",   progress: 72,  rows: "14,280", duration: "3m 12s" },
    { name: "Log Aggregation (Hourly)",     status: "COMPLETED", progress: 100, rows: "89,441", duration: "1m 04s" },
    { name: "Java Audit Log Ingestion",     status: "COMPLETED", progress: 100, rows: "3,821",  duration: "0m 22s" },
    { name: "Text File Parser (Bangalore)", status: "QUEUED",    progress: 0,   rows: "N/A",    duration: "N/A" },
    { name: "Schema Validation Check",      status: "FAILED",    progress: 40,  rows: "N/A",    duration: "1m 58s" },
  ];
  const statusColor = (s) => ({ RUNNING: COLORS.accent, COMPLETED: COLORS.green, QUEUED: COLORS.dim, FAILED: COLORS.danger })[s];
  return (
    <div>
      <div style={gs.sectionHead}>ETL Pipeline Monitor</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.map((j, i) => (
          <div key={i} style={gs.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13 }}>{j.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: COLORS.dim, fontSize: 10 }}>Rows: {j.rows}</span>
                <span style={{ color: COLORS.dim, fontSize: 10 }}>{j.duration}</span>
                <span style={gs.badge(statusColor(j.status))}>{j.status}</span>
              </div>
            </div>
            <div style={{ background: COLORS.border, borderRadius: 3, height: 4 }}>
              <div style={{ width: `${j.progress}%`, height: "100%", borderRadius: 3, background: statusColor(j.status) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [logs, setLogs]               = useState(() => Array.from({ length: 40 }, makeLog));
  const [paused, setPaused]           = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter]           = useState({ level: "ALL", search: "" });
  const [sparkData, setSparkData]     = useState({ info: [], warn: [], error: [] });
  const streamRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const nl = makeLog();
      setLogs(prev => [...prev.slice(-499), nl]);
      setSparkData(prev => ({
        info:  [...prev.info.slice(-20),  nl.level === "INFO"  ? 1 : 0],
        warn:  [...prev.warn.slice(-20),  nl.level === "WARN"  ? 1 : 0],
        error: [...prev.error.slice(-20), nl.level === "ERROR" ? 1 : 0],
      }));
    }, 800);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (streamRef.current && !selectedLog) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [logs, selectedLog]);

  const filteredLogs = logs.filter(l => {
    if (filter.level !== "ALL" && l.level !== filter.level) return false;
    if (filter.search && !l.message.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const counts = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0 };
  logs.forEach(l => { if (counts[l.level] !== undefined) counts[l.level]++; });

  const TABS = [
    { id: "dashboard",  label: "Dashboard" },
    { id: "stream",     label: "Log Stream" },
    { id: "nlquery",    label: "NL to SQL" },
    { id: "ai",         label: "AI Insights" },
    { id: "etl",        label: "ETL Pipelines" },
    { id: "compliance", label: "Compliance" },
  ];

  return (
    <div style={gs.root}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0e1a; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #3a4d6b; border-radius: 2px; }
      `}</style>

      <div style={gs.topBar}>
        <div style={gs.logo}>
          LOGVAULT <span style={{ color: COLORS.dim, fontWeight: 400, fontSize: 12 }}>/ Enterprise</span>
        </div>
        <div style={gs.tabs}>
          {TABS.map(t => <button key={t.id} style={gs.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={gs.dot} />
          <span style={{ color: COLORS.dim, fontSize: 11 }}>LIVE</span>
          <button style={gs.btn(paused ? COLORS.green : COLORS.warn)} onClick={() => setPaused(p => !p)}>
            {paused ? "RESUME" : "PAUSE"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>

        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={gs.grid4}>
              <StatCard label="Total Logs" value={logs.length}   color={COLORS.accent} spark={sparkData.info} />
              <StatCard label="INFO"        value={counts.INFO}  color={COLORS.green}  spark={sparkData.info} />
              <StatCard label="WARN"        value={counts.WARN}  color={COLORS.warn}   spark={sparkData.warn} />
              <StatCard label="ERROR"       value={counts.ERROR} color={COLORS.danger} spark={sparkData.error} />
            </div>
            <div style={gs.card}>
              <div style={gs.sectionHead}>Service Activity</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {SERVICES.map(svc => {
                  const cnt  = logs.filter(l => l.service === svc).length;
                  const errC = logs.filter(l => l.service === svc && l.level === "ERROR").length;
                  return (
                    <div key={svc} style={{ ...gs.card, flex: "1 1 160px", borderColor: errC > 2 ? COLORS.danger + "55" : COLORS.border }}>
                      <div style={{ fontSize: 10, color: COLORS.dim, marginBottom: 4, textTransform: "uppercase" }}>{svc}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.accent }}>{cnt}</div>
                      {errC > 0 && <div style={{ fontSize: 10, color: COLORS.danger, marginTop: 2 }}>{errC} errors</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={gs.card}>
              <div style={gs.sectionHead}>Recent Activity</div>
              {logs.slice(-8).reverse().map(l => (
                <div key={l.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${COLORS.border}20` }}>
                  <span style={{ ...gs.badge(lvlColor(l.level)), fontSize: 9, width: 42 }}>{l.level}</span>
                  <span style={{ color: COLORS.dim, fontSize: 10, width: 65 }}>{l.tsDisp}</span>
                  <span style={{ color: COLORS.muted + "cc", fontSize: 10, width: 110 }}>{l.service}</span>
                  <span style={{ fontSize: 12 }}>{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stream" && (
          <div style={{ display: "flex", gap: 12, height: "calc(100vh - 140px)" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input style={{ ...gs.input, maxWidth: 220 }} placeholder="Search messages..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
                {["ALL", ...LEVELS].map(l => (
                  <button key={l} style={{ ...gs.btn(l === "ALL" ? COLORS.accent : lvlColor(l)), padding: "6px 12px", fontSize: 10, opacity: filter.level === l ? 1 : 0.5 }}
                    onClick={() => setFilter(f => ({ ...f, level: l }))}>{l}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 55px 120px 1fr 90px", gap: 8, padding: "4px 10px", borderBottom: `1px solid ${COLORS.border}` }}>
                {["Time","Level","Service","Message","Trace ID"].map(h => <span key={h} style={{ ...gs.label, marginBottom: 0 }}>{h}</span>)}
              </div>
              <div ref={streamRef} style={{ ...gs.scrollBox, flex: 1, background: "#060b14", borderRadius: 6, border: `1px solid ${COLORS.border}`, padding: 4 }}>
                {filteredLogs.map(l => <LogRow key={l.id} log={l} selected={selectedLog?.id === l.id} onClick={setSelectedLog} />)}
              </div>
              <div style={{ color: COLORS.dim, fontSize: 10, textAlign: "right" }}>Showing {filteredLogs.length} / {logs.length} entries</div>
            </div>
            <div style={{ ...gs.card, width: 260, flexShrink: 0, overflowY: "auto" }}>
              <LogDetail log={selectedLog} />
            </div>
          </div>
        )}

        {activeTab === "nlquery"    && <NLQueryPanel />}
        {activeTab === "ai"         && <AIInsightsPanel logs={logs} />}
        {activeTab === "etl"        && <ETLPanel />}
        {activeTab === "compliance" && <CompliancePanel logs={logs} />}
      </div>
    </div>
  );
}
