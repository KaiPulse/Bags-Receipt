"use client";
import { useState, useRef } from "react";
import Receipt, { ParsedTrade } from "@/components/Receipt";

type Theme = "classic" | "dark" | "terminal";

const EXAMPLE_QUOTES = [
  "Paste your Bags.fm transaction signature",
  "Find it on Solscan after any trade",
  "e.g. 5Kj8mN2pQr...",
];

const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: "classic", label: "Classic", preview: "bg-white text-black" },
  { id: "dark", label: "Dark", preview: "bg-zinc-900 text-white" },
  { id: "terminal", label: "Terminal", preview: "bg-green-950 text-green-400" },
];

export default function Home() {
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trade, setTrade] = useState<ParsedTrade | null>(null);
  const [theme, setTheme] = useState<Theme>("classic");
  const [saving, setSaving] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!signature.trim()) return;
    setLoading(true);
    setError("");
    setTrade(null);

    try {
      const res = await fetch("/api/parse-tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signature.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse transaction");
      setTrade(data.trade);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Check your transaction signature.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!receiptRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: theme === "classic" ? "#ffffff" : theme === "dark" ? "#0f0f0f" : "#001100",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `bags-receipt-${trade?.tokenSymbol?.toLowerCase() || "trade"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleShare() {
    const text = trade
      ? `Just printed my $${trade.tokenSymbol} trade receipt on @BagsApp 🧾\n\n${trade.action === "BUY" ? "Bought" : "Sold"} ${trade.tokenSymbol} • ${trade.platform}\n\nbagsreceipt.xyz #BagsReceipt #Solana`
      : "Generate your trade receipt at bagsreceipt.xyz";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", background: "#10b981", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: "700", fontSize: "14px", fontFamily: "monospace" }}>B</span>
          </div>
          <span style={{ color: "#f5f5f5", fontWeight: "600", fontSize: "15px" }}>Bags Receipt</span>
          <span style={{ background: "#1a1a1a", color: "#10b981", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", border: "1px solid #10b98133" }}>BETA</span>
        </div>
        <a href="https://bags.fm" target="_blank" rel="noopener" style={{ color: "#888", fontSize: "13px", textDecoration: "none" }}>
          bags.fm ↗
        </a>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-block", background: "#10b98115", border: "1px solid #10b98133", color: "#10b981", fontSize: "12px", padding: "4px 14px", borderRadius: "20px", marginBottom: "20px" }}>
            Powered by Bags.fm on Solana
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "700", color: "#f5f5f5", lineHeight: 1.15, marginBottom: "16px" }}>
            Print your trade.<br />
            <span style={{ color: "#10b981" }}>Flex or cry.</span>
          </h1>
          <p style={{ color: "#888", fontSize: "17px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Paste any Bags.fm transaction signature and get a shareable thermal receipt — with a degen quote that hits different.
          </p>
        </div>

        {/* Input section */}
        <div style={{ maxWidth: "640px", margin: "0 auto 48px" }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Transaction Signature
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="5Kj8mN2pQr4xYz..."
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  color: "#f5f5f5",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !signature.trim()}
                style={{
                  background: loading ? "#1a1a1a" : "#10b981",
                  color: loading ? "#888" : "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
              >
                {loading ? "Parsing..." : "Generate ↵"}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: "12px", background: "#2a0a0a", border: "1px solid #ff444433", borderRadius: "8px", padding: "10px 14px", color: "#ff6666", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <p style={{ color: "#444", fontSize: "12px", marginTop: "12px" }}>
              Find your tx signature on{" "}
              <a href="https://solscan.io" target="_blank" rel="noopener" style={{ color: "#10b981", textDecoration: "none" }}>Solscan</a>
              {" "}or Bags.fm after any trade
            </p>
          </div>

          {/* Theme picker */}
          {trade && (
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "500",
                    border: theme === t.id ? "1px solid #10b981" : "1px solid #2a2a2a",
                    background: theme === t.id ? "#10b98115" : "#111",
                    color: theme === t.id ? "#10b981" : "#888",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Receipt display */}
        {trade && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                background: "#111",
                borderRadius: "20px",
                padding: "32px",
                display: "inline-block",
                border: "1px solid #1a1a1a",
              }}
              className="fade-up"
            >
              <Receipt ref={receiptRef} trade={trade} theme={theme} />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {saving ? "Saving..." : "Save PNG"}
              </button>

              <button
                onClick={handleShare}
                style={{
                  background: "#1a1a1a",
                  color: "#f5f5f5",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>

              <button
                onClick={() => { setTrade(null); setSignature(""); }}
                style={{
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                New Receipt
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {!trade && (
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { step: "01", title: "Copy tx hash", desc: "After any trade on Bags.fm, copy the transaction signature from Solscan" },
              { step: "02", title: "Paste & generate", desc: "Paste it here and click Generate. We parse the trade data instantly" },
              { step: "03", title: "Share & flex", desc: "Save as PNG and share to Twitter with your degen rating" },
            ].map((s) => (
              <div key={s.step} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
                <div style={{ color: "#10b981", fontSize: "11px", fontFamily: "monospace", marginBottom: "8px" }}>{s.step}</div>
                <div style={{ color: "#f5f5f5", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>{s.title}</div>
                <div style={{ color: "#666", fontSize: "12px", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px", textAlign: "center", color: "#444", fontSize: "12px" }}>
        Built on Bags.fm · Solana · Not financial advice · bagsreceipt.xyz
      </footer>
    </div>
  );
}
