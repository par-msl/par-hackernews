import { NextRequest, NextResponse } from "next/server";
import { query, ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { postId, voter } = await req.json();
    if (!postId || !voter) return NextResponse.json({ error: "postId and voter required" }, { status: 400 });
    await query("INSERT INTO hn_votes (post_id, voter) VALUES ($1, $2)", [postId, voter]);
    await query("UPDATE hn_posts SET points = points + 1 WHERE id = $1", [postId]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "already voted" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
