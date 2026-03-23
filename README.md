<div align="center">
  <h1>🧾 Bags Receipt</h1>
  <p><strong>Turn any Bags.fm trade into a shareable thermal receipt.</strong></p>
  <p>Flex your gains. Roast your losses. Print the proof.</p>

  <a href="https://bags-receipt.fun"><img src="https://img.shields.io/badge/Live%20Demo-bags--receipt.fun-green?style=for-the-badge" /></a>
  <a href="https://bags.fm"><img src="https://img.shields.io/badge/Built%20for-Bags.fm-black?style=for-the-badge" /></a>
  <a href="https://github.com/KaiPulse/Bags-Receipt/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" /></a>
</div>

---

## ✨ Features

- 🔍 **Instant trade parsing** — paste any Solana tx signature, get a full receipt
- 💰 **Real-time pricing** — supports bonding curve tokens via Bags quote API + graduated tokens via DexScreener
- 📊 **P&L tracking** — see your unrealized gain/loss vs entry price
- 🎨 **3 receipt themes** — Classic, Dark, Terminal
- 🖼️ **Save as PNG** — one-click export for Twitter/X flexing
- 🤖 **Auto-generated visuals** — unique avatar + robot combo seeded by tx hash
- 💬 **60+ degen quotes** — dynamically matched to your P&L outcome
- ⚡ **Zero infra** — no database, no auth, pure serverless

## 🖼️ Preview

| Classic | Dark | Terminal |
|---------|------|----------|
| White thermal receipt | Dark mode receipt | Green matrix style |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Helius API key](https://helius.dev) — free tier works
- [Bags API key](https://dev.bags.fm)

### Local Development
```bash
git clone https://github.com/KaiPulse/Bags-Receipt.git
cd Bags-Receipt
npm install
cp .env.example .env.local
```

Fill in your `.env.local`:
```env
HELIUS_API_KEY=your_helius_api_key
BAGS_API_KEY=your_bags_api_key
NEXT_PUBLIC_URL=http://localhost:3000
```
```bash
npm run dev
# Open http://localhost:3000
```

## 🌐 Deploy

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `HELIUS_API_KEY` | ✅ | [helius.dev](https://helius.dev) |
| `BAGS_API_KEY` | ✅ | [dev.bags.fm](https://dev.bags.fm) |
| `NEXT_PUBLIC_URL` | ✅ | Your production domain |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Transaction Parsing | Helius Enhanced Transactions API |
| Price Data | Bags Trade Quote API + DexScreener |
| PNG Export | html2canvas |
| Visuals | DiceBear + RoboHash |
| Deployment | Vercel |

## 🔌 How It Works
```
User pastes tx signature
        ↓
Helius parses on-chain data (swap type, amounts, wallet)
        ↓
Bags Quote API → current token price (bonding curve)
DexScreener   → current price + 24h change (graduated tokens)
        ↓
P&L = current value − entry value (SOL spent × SOL price)
        ↓
Receipt rendered → save PNG → share on Twitter
```

## 📁 Project Structure
```
src/
├── app/
│   ├── api/parse-tx/     # Helius tx parsing endpoint
│   └── page.tsx          # Main UI
├── components/
│   └── Receipt.tsx       # Receipt component (all themes)
└── lib/
    ├── helius.ts         # Transaction parsing + price logic
    ├── quotes.ts         # Degen quotes + rating system
    └── visuals.ts        # Deterministic visual generation
```

## 🤝 Contributing

PRs welcome. Open an issue first for major changes.

## 📄 License

MIT © [KaiPulse](https://github.com/KaiPulse)

---

<div align="center">
  <sub>Built for the <a href="https://bags.fm">Bags.fm</a> Hackathon • Not financial advice • DYOR</sub>
</div>
