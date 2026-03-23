export const QUOTES = {
  bigWin: [
    "You didn't buy the dip. You ARE the dip that dipped and came back.",
    "Sigma male detected. Your wallet smells like profits and regret.",
    "Congrats. Now hold until it goes to zero like a real degen.",
    "Based. Absolutely cooked. We're all going to make it, maybe.",
    "Your ancestors are crying tears of joy and embarrassment simultaneously.",
    "The math is mathing. For once. Don't get used to it.",
    "Sir this is a Wendy's but also your bags are heavy af.",
    "You bought the rumor. Now sell the news. Or don't. Degen.",
  ],
  smallWin: [
    "A win is a win. Your mom would still be confused by this.",
    "Not financial advice. But if it were, you'd be up.",
    "Gm. Touch grass. Also nice trade, soldier.",
    "The market giveth. The market taketh. Today it gaveth.",
    "You're slightly less poor than yesterday. Progress.",
    "This trade is brought to you by sleep deprivation and chart patterns.",
    "Entry was kinda sus but the exit is clean. We move.",
  ],
  smallLoss: [
    "You didn't buy the dip. You bought the cliff.",
    "This is fine. Everything is fine. The chart is fine.",
    "Studies show 87% of degen losses happen between 2am-5am. Were you awake?",
    "Anon, you were right about the token. Wrong about the timing. Again.",
    "Sir your funds are having a temporary out-of-wallet experience.",
    "You contributed to price discovery. Downward price discovery.",
    "Not your fault. Probably. Maybe. Check your entry next time.",
  ],
  bigLoss: [
    "Congratulations on funding someone else's yacht.",
    "You didn't lose money. You made a $X donation to the market.",
    "The token went to zero. Your conviction did not. Respect, kinda.",
    "This is just unrealized loss. Touch grass, it'll pump back. Maybe.",
    "Your portfolio is now a performance art piece about hope.",
    "NGMI. JK. WAGMI. JK again. Sorry bro.",
    "The chart said support was there. The chart lied. The chart always lies.",
    "At least the gas fees were affordable. Silver linings.",
  ],
  neutral: [
    "Somewhere between diamond hands and paper hands. Cotton hands.",
    "You exist. You traded. The blockchain recorded it forever.",
    "This transaction has been immortalized on Solana. Congrats?",
    "Your future self is looking at this receipt. Hard to say how they feel.",
    "Not financial advice. Not real advice. Just a receipt. You're welcome.",
    "The market has no opinion of you. But we do. Trade wisely.",
    "Solana go brrr. Your wallet go mmm.",
    "Receipt printed. Decisions made. Regrets pending.",
  ],
};

export function getQuote(
  pnlPercent: number | null,
  amountUsd: number
): string {
  let pool: string[];

  if (pnlPercent === null) {
    pool = QUOTES.neutral;
  } else if (pnlPercent >= 50) {
    pool = QUOTES.bigWin;
  } else if (pnlPercent >= 5) {
    pool = QUOTES.smallWin;
  } else if (pnlPercent >= -20) {
    pool = QUOTES.smallLoss;
  } else {
    pool = QUOTES.bigLoss;
  }

  // deterministic based on amount so same tx always gets same quote
  const idx = Math.abs(Math.floor(amountUsd * 100)) % pool.length;
  return pool[idx];
}

export const DEGEN_RATINGS = [
  { min: 1000, label: "WHALE", emoji: "🐋" },
  { min: 500, label: "SHARK", emoji: "🦈" },
  { min: 100, label: "DEGEN", emoji: "🎰" },
  { min: 50, label: "TRENCH", emoji: "⚔️" },
  { min: 10, label: "HOPIUM", emoji: "🌿" },
  { min: 0, label: "DUST", emoji: "💨" },
];

export function getDegenRating(amountUsd: number) {
  return (
    DEGEN_RATINGS.find((r) => amountUsd >= r.min) ||
    DEGEN_RATINGS[DEGEN_RATINGS.length - 1]
  );
}
