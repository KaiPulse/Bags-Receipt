// Deterministic seeded random — same tx signature always produces same images
function seededRand(seed: string, index: number = 0): number {
  let hash = 0;
  const str = seed + String(index);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) / 2147483647;
}

function pick<T>(arr: T[], seed: string, index = 0): T {
  return arr[Math.floor(seededRand(seed, index) * arr.length)];
}

// ─── DiceBear avatars (100% free, no API key) ────────────────────
// Different style pools per outcome so visuals match the vibe
const WIN_STYLES  = ["adventurer","fun-emoji","croodles","micah","personas","lorelei","notionists"];
const LOSS_STYLES = ["adventurer-neutral","bottts-neutral","pixel-art","open-peeps","dylan","shapes"];
const MID_STYLES  = ["thumbs","bottts","identicon","rings","avataaars","pixel-art-neutral"];

export function getAvatarUrl(mint: string, outcome: "win" | "loss" | "neutral"): string {
  const styles = outcome === "win" ? WIN_STYLES : outcome === "loss" ? LOSS_STYLES : MID_STYLES;
  const style  = pick(styles, mint, 1);
  const seed   = mint.slice(0, 16);
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}&size=80&backgroundColor=transparent`;
}

// ─── RoboHash (100% free, no API key) ────────────────────────────
// set1=robots set2=monsters set3=robot heads set4=cats
const ROBO_SETS = ["set1", "set2", "set3", "set4"];
export function getRoboUrl(mint: string): string {
  const s = pick(ROBO_SETS, mint, 2);
  return `https://robohash.org/${mint.slice(0, 20)}?set=${s}&size=80x80&bgset=bg2`;
}

// ─── Kaomoji faces ────────────────────────────────────────────────
const KAOMOJI_WIN = [
  "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "( •̀ ω •́ )✧", "٩(◕‿◕｡)۶",
  "(*≧ω≦*)", "ヽ(´▽`)/", "☆*:.｡.o(≧▽≦)o.｡.:*☆",
  "ᕙ(⇀‸↼‶)ᕗ", "(づ｡◕‿‿◕｡)づ",
];
const KAOMOJI_LOSS = [
  "(╯°□°）╯︵ ┻━┻", "ヽ(｀⌒´メ)ノ", "щ(ಥДಥщ)",
  "(；´д｀)ゞ", "┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻", "(╥_╥)",
  "o(╥﹏╥)o", "(ง'̀-'́)ง",
];
const KAOMOJI_MID = [
  "¯\\_(ツ)_/¯", "(・_・;)", "눈_눈", "( ͡° ͜ʖ ͡°)",
  "（；¬＿¬)", "(￣_￣|||)", "m(._.)m", "( ˘ ³˘)♥",
];

export function getKaomoji(mint: string, outcome: "win" | "loss" | "neutral"): string {
  const pool = outcome === "win" ? KAOMOJI_WIN : outcome === "loss" ? KAOMOJI_LOSS : KAOMOJI_MID;
  return pick(pool, mint, 3);
}

// ─── Status banners ───────────────────────────────────────────────
const BANNER_BIG_WIN    = ["PRINTING MONEY","SIGMA GRINDSET","WE ARE SO BACK","TOUCH GRASS LATER","NGMI → WAGMI","GENERATIONAL WEALTH?"];
const BANNER_SMALL_WIN  = ["SLIGHTLY RICHER","SMALL W IS STILL W","OK NOT BAD","HOLD OR COPE?","MAYBE FINANCIAL ADVISOR","IT'S SOMETHING"];
const BANNER_SMALL_LOSS = ["TEMPORARY SETBACK","IT'LL PUMP BACK","DIAMOND HANDS MODE","JUST UNREALIZED","BUYING THE DIP?","GOTTA LOSE TO WIN"];
const BANNER_BIG_LOSS   = ["FUNDING THEIR YACHT","REKT BUT ALIVE","NGMI (FOR NOW)","DELETED BLOCKFOLIO","SKILL ISSUE?","MARKET SAYS NO"];

export function getBanner(mint: string, pnlPercent: number | null): string {
  const pool =
    pnlPercent === null     ? [...BANNER_SMALL_WIN, ...BANNER_SMALL_LOSS] :
    pnlPercent >= 30        ? BANNER_BIG_WIN :
    pnlPercent >= 0         ? BANNER_SMALL_WIN :
    pnlPercent >= -20       ? BANNER_SMALL_LOSS :
                              BANNER_BIG_LOSS;
  return pick(pool, mint, 4);
}

// ─── Stamp labels ─────────────────────────────────────────────────
const STAMP_WIN  = ["CASHED","MOONED","BASED","SIGMA","COOKED","ALPHA","PUMP"];
const STAMP_LOSS = ["REKT","RIPPED","DUMPED","NGMI","REKT","RIPPED","REKT"];
const STAMP_MID  = ["PENDING","HODL","IDK","MAYBE","NEUTRAL","??","COPE"];

export function getStamp(mint: string, outcome: "win" | "loss" | "neutral"): string {
  const pool = outcome === "win" ? STAMP_WIN : outcome === "loss" ? STAMP_LOSS : STAMP_MID;
  return pick(pool, mint, 5);
}

// ─── Outcome helper ───────────────────────────────────────────────
export function getOutcome(pnlPercent: number | null): "win" | "loss" | "neutral" {
  if (pnlPercent === null) return "neutral";
  return pnlPercent >= 0 ? "win" : "loss";
}
