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

const HELIUS_API = "https://api.helius.xyz/v0";
const HELIUS_KEY = process.env.HELIUS_API_KEY!;
const BAGS_API = "https://public-api-v2.bags.fm/api/v1";
const BAGS_KEY = process.env.BAGS_API_KEY!;

async function getSolPriceUsd(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const data = await res.json();
    return data?.solana?.usd ?? 130;
  } catch {
    return 130;
  }
}

async function getTokenPriceFromBags(mint: string): Promise<number | null> {
  try {
    const solAmount = 10000000;
    const res = await fetch(
      `${BAGS_API}/trade/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${mint}&amount=${solAmount}`,
      { headers: { "x-api-key": BAGS_KEY } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;

    const inAmount = parseFloat(data.response.inAmount);
    const outAmount = parseFloat(data.response.outAmount);
    const inDecimals = 9;
    const outDecimals = data.response.routePlan?.[0]?.outputMintDecimals ?? 9;

    const solIn = inAmount / Math.pow(10, inDecimals);
    const tokensOut = outAmount / Math.pow(10, outDecimals);

    if (tokensOut === 0) return null;

    const solPriceUsd = await getSolPriceUsd();
    return (solIn / tokensOut) * solPriceUsd;
  } catch {
    return null;
  }
}

async function getTokenPriceDexscreener(mint: string): Promise<{ priceUsd: number | null; priceChange24h: number | null }> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
    const data = await res.json();
    const pairs = (data?.pairs || []).sort((a: any, b: any) =>
      parseFloat(b.liquidity?.usd || "0") - parseFloat(a.liquidity?.usd || "0")
    );
    const pair = pairs[0];
    if (pair?.priceUsd) {
      return {
        priceUsd: parseFloat(pair.priceUsd),
        priceChange24h: pair.priceChange?.h24 ? parseFloat(pair.priceChange.h24) : null,
      };
    }
  } catch {}
  return { priceUsd: null, priceChange24h: null };
}

export async function parseTrade(signature: string): Promise<ParsedTrade> {
  const txRes = await fetch(
    `${HELIUS_API}/transactions?api-key=${HELIUS_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: [signature] }),
    }
  );

  if (!txRes.ok) throw new Error(`Helius error: ${txRes.status}`);

  const txData = await txRes.json();
  const tx = txData[0];
  if (!tx) throw new Error("Transaction not found");

  const tokenTransfers = tx.tokenTransfers || [];
  const nativeTransfers = tx.nativeTransfers || [];

  if (tokenTransfers.length === 0) {
    throw new Error("No token transfers found. This may not be a swap transaction.");
  }

  const wallet = tx.feePayer;

  const outgoing = tokenTransfers.find(
    (t: any) =>
      t.fromUserAccount === wallet &&
      t.mint !== "So11111111111111111111111111111111111111112"
  );

  const incoming = tokenTransfers.find(
    (t: any) =>
      t.toUserAccount === wallet &&
      t.mint !== "So11111111111111111111111111111111111111112"
  );

  const solOut = nativeTransfers
    .filter((t: any) => t.fromUserAccount === wallet)
    .reduce((s: number, t: any) => s + t.amount, 0);

  const solIn = nativeTransfers
    .filter((t: any) => t.toUserAccount === wallet)
    .reduce((s: number, t: any) => s + t.amount, 0);

  const netSolLamports = solOut - solIn;
  const netSolAbs = Math.abs(netSolLamports) / 1e9;

  let action: "BUY" | "SELL";
  let tokenMint: string;
  let tokenAmount: number;
  const solAmount: number = netSolAbs;

  if (incoming && netSolLamports > 0) {
    action = "BUY";
    tokenMint = incoming.mint;
    tokenAmount = incoming.tokenAmount;
  } else if (outgoing && netSolLamports < 0) {
    action = "SELL";
    tokenMint = outgoing.mint;
    tokenAmount = outgoing.tokenAmount;
  } else {
    action = incoming ? "BUY" : "SELL";
    const transfer = incoming || outgoing;
    tokenMint = transfer?.mint || "";
    tokenAmount = transfer?.tokenAmount || 0;
  }

  let tokenSymbol = "TOKEN";
  let tokenName = "Unknown Token";
  let tokenLogo: string | null = null;

  try {
    const metaRes = await fetch(
      `${HELIUS_API}/token-metadata?api-key=${HELIUS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mintAccounts: [tokenMint] }),
      }
    );
    const metaData = await metaRes.json();
    const meta = metaData[0];
    if (meta) {
      tokenSymbol = meta.onChainMetadata?.metadata?.data?.symbol?.trim() || "TOKEN";
      tokenName = meta.onChainMetadata?.metadata?.data?.name?.trim() || "Unknown";
      tokenLogo = meta.offChainMetadata?.image || null;
    }
  } catch {}

  let priceUsd: number | null = null;
  let priceChange24h: number | null = null;

  const dex = await getTokenPriceDexscreener(tokenMint);
  if (dex.priceUsd) {
    priceUsd = dex.priceUsd;
    priceChange24h = dex.priceChange24h;
  } else {
    priceUsd = await getTokenPriceFromBags(tokenMint);
  }

  const totalUsd = priceUsd && tokenAmount ? tokenAmount * priceUsd : null;

  let pnl24h: number | null = null;
  let pnlPercent24h: number | null = null;

  if (totalUsd !== null) {
    if (priceChange24h !== null && priceUsd) {
      // Graduated token: pakai priceChange24h dari DexScreener
      const priceThen = priceUsd / (1 + priceChange24h / 100);
      const valueThen = tokenAmount * priceThen;
      pnl24h = parseFloat((totalUsd - valueThen).toFixed(4));
      pnlPercent24h = parseFloat(priceChange24h.toFixed(2));
    } else if (solAmount > 0) {
      // Bonding curve: hitung dari SOL spent vs nilai sekarang
      const solPriceUsd = await getSolPriceUsd();
      const buyValueUsd = solAmount * solPriceUsd;
      pnl24h = parseFloat((totalUsd - buyValueUsd).toFixed(4));
      pnlPercent24h = parseFloat(((pnl24h / buyValueUsd) * 100).toFixed(2));
    }
  }

  const platform = detectPlatform(tx);

  return {
    signature,
    wallet,
    tokenSymbol,
    tokenName,
    tokenMint,
    tokenLogo,
    action,
    amountIn: action === "BUY" ? solAmount : tokenAmount,
    amountOut: action === "BUY" ? tokenAmount : solAmount,
    amountInSymbol: action === "BUY" ? "SOL" : tokenSymbol,
    amountOutSymbol: action === "BUY" ? tokenSymbol : "SOL",
    priceUsd,
    totalUsd,
    pnl24h,
    pnlPercent24h,
    timestamp: tx.timestamp * 1000,
    platform,
  };
}

function detectPlatform(tx: any): string {
  const accounts: string[] = tx.accountData?.map((a: any) => a.account) || [];
  const desc = tx.description?.toLowerCase() || "";

  if (
    accounts.includes("BagsFMb1re8v64qr4cGNdFHdm6EV4WsaFBrMEECPNz6") ||
    desc.includes("bags")
  )
    return "Bags.fm";
  if (desc.includes("jupiter") || desc.includes("jup")) return "Jupiter";
  if (desc.includes("pump")) return "Pump.fun";
  if (desc.includes("raydium")) return "Raydium";
  return "Solana DEX";
}
