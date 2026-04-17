// src/App.jsx
import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8099";

function App() {
  const [contractAddress, setContractAddress] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | payment_required | paid | error
  const [paymentChallenge, setPaymentChallenge] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const runScan = async () => {
    if (!contractAddress) return;
    setStatus("loading");
    setResult(null);
    setPaymentChallenge(null);

    try {
      addLog(`📡 Requesting scan for ${contractAddress}...`);
      
      // Step 1: Send the request — expect 402
      const response = await axios.post(
        `${API_URL}/shield`,
        { contractAddress },
        { validateStatus: () => true } // Don't throw on 402
      );

      if (response.status === 402) {
        addLog("⚡ 402 Payment Required received from BuzzShield");
        addLog(`💸 Cost: ${formatPrice(response.data.accepts[0].maxAmountRequired)} USDC.e`);
        setPaymentChallenge(response.data);
        setStatus("payment_required");
        return;
      }

      if (response.status === 200) {
        addLog("✅ Scan complete!");
        setResult(response.data);
        setStatus("paid");
      }
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
      setStatus("error");
    }
  };

  // This simulates what the Kite MCP tool does automatically for agents
  const simulatePayment = async () => {
    addLog("🔐 Simulating Kite Passport payment authorization...");
    addLog("📝 Agent calling get_payer_addr via MCP...");
    addLog("✍️  Agent calling approve_payment via MCP...");
    addLog("🔄 Retrying request with X-Payment header...");
    
    // In production, this comes from the Kite MCP tool
    // For frontend testing, we show the flow visually
    // Real agents don't use this UI — they go through MCP directly
    setTimeout(() => {
      addLog("ℹ️  Note: Real agents use Kite MCP tools, not this UI.");
      addLog("📖 See the developer guide for agent integration.");
      setStatus("idle");
    }, 2000);
  };

  const formatPrice = (wei) => {
    return (parseInt(wei) / 1e18).toFixed(4);
  };

  const getVerdictColor = (verdict) => {
    if (verdict === "SAFE") return "#22c55e";
    if (verdict === "SUSPICIOUS") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="app">
      <header>
        <h1>🛡️ BuzzShield</h1>
        <p className="subtitle">AI-Native Smart Contract Security — Powered by Kite PISP & x402</p>
        <div className="badge">Chain: Kite Testnet · ChainID: 2368</div>
      </header>

      <main>
        <section className="scan-box">
          <h2>Scan a Contract</h2>
          <div className="input-row">
            <input
              type="text"
              placeholder="Enter contract address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
            <button onClick={runScan} disabled={status === "loading"}>
              {status === "loading" ? "Scanning..." : "Run Scan — $0.02"}
            </button>
          </div>
        </section>

        {status === "payment_required" && paymentChallenge && (
          <section className="challenge-box">
            <h3>⚡ Payment Required (HTTP 402)</h3>
            <p>BuzzShield issued a payment challenge. An AI agent would handle this automatically via Kite Passport MCP.</p>
            <div className="challenge-detail">
              <div><strong>Amount:</strong> {formatPrice(paymentChallenge.accepts[0].maxAmountRequired)} USDC.e</div>
              <div><strong>Pay to:</strong> {paymentChallenge.accepts[0].payTo}</div>
              <div><strong>Network:</strong> {paymentChallenge.accepts[0].network}</div>
              <div><strong>Scheme:</strong> {paymentChallenge.accepts[0].scheme}</div>
            </div>
            <button className="pay-btn" onClick={simulatePayment}>
              Simulate Agent Payment Flow
            </button>
          </section>
        )}

        {result && (
          <section className="result-box">
            <h3>Scan Results</h3>
            <div className="verdict" style={{ borderColor: getVerdictColor(result.verdict) }}>
              <span className="verdict-label">Verdict:</span>
              <span style={{ color: getVerdictColor(result.verdict) }}>{result.verdict}</span>
            </div>
            <div className="score">Risk Score: <strong>{result.riskScore}/100</strong></div>
            {result.flags.length > 0 ? (
              <ul className="flags">
                {result.flags.map((f, i) => (
                  <li key={i} className={`flag ${f.severity.toLowerCase()}`}>
                    [{f.severity}] {f.issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="clean">✅ No vulnerabilities detected</p>
            )}
            <div className="scanned-at">Scanned at: {result.scannedAt}</div>
          </section>
        )}

        <section className="log-box">
          <h3>📋 Activity Log</h3>
          {logs.length === 0 ? <p className="empty">No activity yet.</p> : (
            <ul>
              {logs.map((log, i) => <li key={i}>{log}</li>)}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;