import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSchema } from "@/lib/db";

export async function GET() {
  const sql = getDb();
  await ensureSchema();
  const posts = await sql`SELECT id, title, url, body, author, points, created_at FROM hn_posts ORDER BY points DESC, created_at DESC LIMIT 50`;
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  await ensureSchema();
  const { title, url, body, author } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const result = await sql`INSERT INTO hn_posts (title, url, body, author) VALUES (${title}, ${url || null}, ${body || null}, ${author || "anon"}) RETURNING *`;
  return NextResponse.json(result[0], { status: 201 });
}
