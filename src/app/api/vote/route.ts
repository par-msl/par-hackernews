import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  const sql = getDb();
  await ensureSchema();
  const { postId, voter } = await req.json();
  if (!postId || !voter) return NextResponse.json({ error: "postId and voter required" }, { status: 400 });
  try {
    await sql`INSERT INTO hn_votes (post_id, voter) VALUES (${postId}, ${voter})`;
    await sql`UPDATE hn_posts SET points = points + 1 WHERE id = ${postId}`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "already voted" }, { status: 409 });
    }
    throw e;
  }
}
