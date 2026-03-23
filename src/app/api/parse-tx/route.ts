import { NextRequest, NextResponse } from "next/server";
import { parseTrade } from "@/lib/helius";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { signature } = await req.json();

    if (!signature || typeof signature !== "string") {
      return NextResponse.json({ error: "Missing transaction signature" }, { status: 400 });
    }

    const clean = signature.trim();
    if (clean.length < 40 || clean.length > 128) {
      return NextResponse.json({ error: "Invalid transaction signature format" }, { status: 400 });
    }

    if (!process.env.HELIUS_API_KEY) {
      return NextResponse.json(
        { error: "HELIUS_API_KEY not configured" },
        { status: 503 }
      );
    }

    const trade = await parseTrade(clean);
    return NextResponse.json({ trade });
  } catch (err: any) {
    console.error("[parse-tx]", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse transaction" },
      { status: 500 }
    );
  }
}
