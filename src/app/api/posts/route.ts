import { NextRequest, NextResponse } from "next/server";
import { query, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const posts = await query("SELECT id, title, url, body, author, points, created_at FROM hn_posts ORDER BY points DESC, created_at DESC LIMIT 50");
    return NextResponse.json(posts);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { title, url, body, author } = await req.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    const rows = await query("INSERT INTO hn_posts (title, url, body, author) VALUES ($1, $2, $3, $4) RETURNING *", [title, url || null, body || null, author || "anon"]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
