# Bags Receipt

Turn any Bags.fm trade into a shareable thermal receipt. Flex your gains or roast your losses.

## Setup

```bash
npm install -g pnpm
pnpm install
cp .env.example .env.local
# Fill in HELIUS_API_KEY
pnpm dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HELIUS_API_KEY` | Yes | Get from [helius.dev](https://helius.dev) |
| `BIRDEYE_API_KEY` | No | For USD price data |
| `NEXT_PUBLIC_URL` | No | Your domain |

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add env vars in Vercel dashboard → Settings → Environment Variables.

## Run on VPS via Vercel CLI

```bash
# Install on VPS
npm install -g vercel pm2

# Clone and build
git clone https://github.com/yourname/bags-receipt
cd bags-receipt
pnpm install
pnpm build

# Create .env.production with your keys
cp .env.example .env.production
nano .env.production

# Start with PM2
pm2 start "pnpm start" --name bags-receipt
pm2 save
pm2 startup
```

Then point Nginx to `localhost:3000`.

## Tech Stack

- Next.js 14
- Helius RPC (transaction parsing)
- Birdeye (price data)
- html2canvas (PNG export)
- Zero database, zero auth
