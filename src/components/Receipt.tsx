"use client";
import { forwardRef } from "react";
import { getQuote, getDegenRating } from "@/lib/quotes";
import {
  getAvatarUrl,
  getRoboUrl,
  getKaomoji,
  getBanner,
  getStamp,
  getOutcome,
} from "@/lib/visuals";

export interface ParsedTrade {
  signature: string;
  wallet: string;
  tokenSymbol: string;
  tokenName: string;
  tokenMint: string;
  tokenLogo: string | null;
  action: "BUY" | "SELL";
  amountIn: number;
  amountOut: number;
  amountInSymbol: string;
  amountOutSymbol: string;
  priceUsd: number | null;
  totalUsd: number | null;
  pnl24h: number | null;
  pnlPercent24h: number | null;
  timestamp: number;
  platform: string;
}

export type Theme = "classic" | "dark" | "terminal";

const THEMES = {
  classic: {
    bg: "#ffffff", text: "#111111", muted: "#888888",
    border: "#dddddd", accent: "#000000",
    positive: "#16a34a", negative: "#dc2626",
    stripeBg: "#f0f0f0", stampColor: "#dc2626",
  },
  dark: {
    bg: "#0f0f0f", text: "#f0f0f0", muted: "#666666",
    border: "#2a2a2a", accent: "#ffffff",
    positive: "#4ade80", negative: "#f87171",
    stripeBg: "#1a1a1a", stampColor: "#f87171",
  },
  terminal: {
    bg: "#001800", text: "#00ff41", muted: "#006400",
    border: "#003200", accent: "#00ff41",
    positive: "#00ff41", negative: "#ff4444",
    stripeBg: "#002200", stampColor: "#00ff41",
  },
};

function fmt(n: number, d = 4): string {
  if (!n) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  if (n < 0.0001) return n.toExponential(2);
  return n.toFixed(d);
}
function fmtUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.000001) return `$${n.toFixed(8)}`;
  return `$${n.toExponential(2)}`;
}
function fmtWallet(w: string) { return `${w.slice(0, 4)}...${w.slice(-4)}`; }
function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "UTC",
  }) + " UTC";
}
function oid(sig: string) {
  return `${sig.slice(0, 4)}-${sig.slice(4, 8)}-${sig.slice(8, 12)}`.toUpperCase();
}

const Receipt = forwardRef<HTMLDivElement, { trade: ParsedTrade; theme?: Theme }>(
  function Receipt({ trade, theme = "classic" }, ref) {
    const c       = THEMES[theme];
    const outcome = getOutcome(trade.pnlPercent24h);
    const quote   = getQuote(trade.pnlPercent24h, trade.totalUsd || trade.amountIn);
    const rating  = getDegenRating(trade.totalUsd || trade.amountIn * 150);
    const kaomoji = getKaomoji(trade.tokenMint, outcome);
    const banner  = getBanner(trade.tokenMint, trade.pnlPercent24h);
    const stamp   = getStamp(trade.tokenMint, outcome);
    const avatarUrl = getAvatarUrl(trade.tokenMint, outcome);
    const roboUrl   = getRoboUrl(trade.tokenMint);
    const pnlPos  = (trade.pnlPercent24h || 0) >= 0;

    const base: React.CSSProperties = {
      fontFamily: "'Space Mono', monospace",
      background: c.bg, color: c.text,
      width: "360px", padding: "0 20px", position: "relative",
    };
    const stripe: React.CSSProperties = {
      height: "14px",
      background: `repeating-linear-gradient(90deg,${c.bg} 0,${c.bg} 10px,${c.stripeBg} 10px,${c.stripeBg} 20px)`,
      margin: "0 -20px",
    };
    const row: React.CSSProperties = {
      display: "flex", justifyContent: "space-between",
      fontSize: "11px", marginBottom: "7px", lineHeight: 1.4,
    };
    const lbl: React.CSSProperties = { color: c.muted };
    const val: React.CSSProperties = {
      color: c.text, fontWeight: "700", textAlign: "right",
      maxWidth: "210px", wordBreak: "break-all",
    };
    const hr: React.CSSProperties = {
      border: "none", borderTopWidth: "1px", borderTopStyle: "dashed",
      borderTopColor: c.border, margin: "12px 0",
    };

    return (
      <div ref={ref} style={base}>
        <div style={{ ...stripe, borderRadius: "4px 4px 0 0" }} />

        <div style={{ padding: "16px 0 8px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "4px", color: c.accent }}>
              BAGS.FM
            </div>
            <div style={{ fontSize: "9px", color: c.muted, letterSpacing: "2px", marginTop: "2px" }}>
              OFFICIAL TRADE RECEIPT
            </div>
          </div>

          {/* ── FUNNY IMAGE BLOCK ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 8px", background: c.stripeBg, borderRadius: "6px",
            marginBottom: "14px", border: `1px solid ${c.border}`,
          }}>
            {/* DiceBear avatar — unique per token mint, changes style by outcome */}
            <img
              src={avatarUrl} alt="mascot"
              width={64} height={64}
              style={{ borderRadius: "8px", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />

            {/* Center: kaomoji + status banner */}
            <div style={{ textAlign: "center", flex: 1, padding: "0 8px" }}>
              <div style={{ fontSize: "15px", marginBottom: "5px", lineHeight: 1 }}>
                {kaomoji}
              </div>
              <div style={{
                fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
                color: outcome === "win" ? c.positive : outcome === "loss" ? c.negative : c.muted,
              }}>
                {banner}
              </div>
            </div>

            {/* Robohash robot — unique per wallet/tx */}
            <img
              src={roboUrl} alt="trade bot"
              width={64} height={64}
              style={{ borderRadius: "8px", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* Meta */}
          <div style={row}><span style={lbl}>ORDER</span><span style={val}># {oid(trade.signature)}</span></div>
          <div style={row}><span style={lbl}>DATE</span><span style={val}>{fmtDate(trade.timestamp)}</span></div>
          <div style={row}><span style={lbl}>TIME</span><span style={val}>{fmtTime(trade.timestamp)}</span></div>
          <div style={row}><span style={lbl}>WALLET</span><span style={val}>{fmtWallet(trade.wallet)}</span></div>
          <div style={row}><span style={lbl}>PLATFORM</span><span style={val}>{trade.platform.toUpperCase()}</span></div>

          <hr style={hr} />

          {/* Trade */}
          <div style={row}>
            <span style={lbl}>ACTION</span>
            <span style={{ ...val, color: trade.action === "BUY" ? c.positive : c.negative, fontSize: "13px" }}>
              *** {trade.action} ***
            </span>
          </div>
          <div style={row}><span style={lbl}>TOKEN</span><span style={{ ...val, fontSize: "13px" }}>${trade.tokenSymbol}</span></div>
          <div style={row}><span style={lbl}>NAME</span><span style={val}>{trade.tokenName.toUpperCase().slice(0, 24)}</span></div>
          <div style={row}>
            <span style={lbl}>MINT</span>
            <span style={{ ...val, fontSize: "9px" }}>{trade.tokenMint.slice(0, 8)}...{trade.tokenMint.slice(-6)}</span>
          </div>

          <hr style={hr} />

          {/* Amounts */}
          <div style={row}><span style={lbl}>PAID</span><span style={val}>{fmt(trade.amountIn)} {trade.amountInSymbol}</span></div>
          <div style={row}><span style={lbl}>RECEIVED</span><span style={val}>{fmt(trade.amountOut)} {trade.amountOutSymbol}</span></div>
          {trade.priceUsd != null && (
            <div style={row}><span style={lbl}>PRICE/TOKEN</span><span style={val}>{fmtUsd(trade.priceUsd)}</span></div>
          )}
          {trade.totalUsd != null && (
            <div style={row}>
              <span style={lbl}>TOTAL VALUE</span>
              <span style={{ ...val, fontSize: "13px" }}>{fmtUsd(trade.totalUsd)}</span>
            </div>
          )}

          {/* P&L */}
          {trade.pnl24h !== null && trade.pnlPercent24h !== null && (
            <>
              <hr style={hr} />
              <div style={row}>
                <span style={lbl}>P&L (24H)</span>
                <span style={{ ...val, color: pnlPos ? c.positive : c.negative, fontSize: "13px" }}>
                  {pnlPos ? "+" : ""}{fmtUsd(trade.pnl24h)}&nbsp;
                  ({pnlPos ? "+" : ""}{trade.pnlPercent24h.toFixed(1)}%)
                </span>
              </div>
            </>
          )}

          <hr style={hr} />

          {/* Degen rating */}
          <div style={{ textAlign: "center", margin: "12px 0" }}>
            <div style={{ fontSize: "9px", color: c.muted, letterSpacing: "1px" }}>DEGEN RATING</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: c.accent, letterSpacing: "2px", marginTop: "2px" }}>
              {rating.label}
            </div>
          </div>

          {/* Quote */}
          <div style={{
            fontSize: "10px", color: c.muted, textAlign: "center",
            lineHeight: 1.7, fontStyle: "italic", margin: "10px 0", padding: "0 4px",
          }}>
            "{quote}"
          </div>

          <hr style={hr} />

          {/* Stamp */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span style={{
              display: "inline-block",
              border: `2px solid ${c.stampColor}`,
              color: c.stampColor,
              fontSize: "13px", fontWeight: "700",
              letterSpacing: "3px", padding: "3px 12px",
              borderRadius: "4px", transform: "rotate(-8deg)",
              opacity: 0.75,
            }}>
              {stamp}
            </span>
          </div>

          {/* Barcode footer */}
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <div style={{ fontSize: "9px", color: c.muted, letterSpacing: "1px", marginBottom: "8px" }}>
              NOT FINANCIAL ADVICE · DYOR
            </div>
            <div style={{ fontSize: "28px", letterSpacing: "-2px", color: c.text, opacity: 0.1, lineHeight: 1 }}>
              {"|}|".repeat(10)}
            </div>
            <div style={{ fontSize: "9px", color: c.muted, marginTop: "5px" }}>
              {trade.signature.slice(0, 14).toUpperCase()}...
            </div>
            <div style={{ fontSize: "9px", color: c.muted, marginTop: "3px", fontWeight: "700", letterSpacing: "1px" }}>
              BAGSRECEIPT.XYZ
            </div>
          </div>
        </div>

        <div style={{ ...stripe, borderRadius: "0 0 4px 4px" }} />
      </div>
    );
  }
);

export default Receipt;
