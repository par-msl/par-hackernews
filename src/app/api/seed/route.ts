import { NextResponse } from "next/server";
import { query, ensureSchema } from "@/lib/db";

export async function POST() {
  try {
    await ensureSchema();
    await query("INSERT INTO hn_posts (title, url, author, points) VALUES ('Internal Neon POC is live on Meta AWS EKS', 'https://neon.tech', 'mpercy', 10), ('Show PAR-HN: Stress testing the Neon integration', NULL, 'benny', 5), ('Neon branching: instant copy-on-write database copies', 'https://neon.tech/docs/introduction/branching', 'pg_fan', 3), ('Why we chose Neon over Aurora for internal workloads', NULL, 'datastores_team', 7) ON CONFLICT DO NOTHING");
    return NextResponse.json({ ok: true, message: "seeded" });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
