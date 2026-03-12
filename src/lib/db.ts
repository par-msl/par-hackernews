import { neon, neonConfig, NeonQueryFunction } from "@neondatabase/serverless";
import ws from "ws";

// Internal Neon PrivateLink config (from the POC demo)
const PROXY_HOST =
  process.env.PROXY_HOST ||
  "vpce-0ed6fa2a25f5bbf43-8rl63vdv.vpce-svc-0594e55da659cc7bf.us-west-2.vpce.amazonaws.com";
const PROXY_WSS_PORT = process.env.PROXY_WSS_PORT || "44110";
const BRANCH = process.env.NEON_BRANCH || "branch-mvp";

let _configured = false;

function configure() {
  if (_configured) return;
  _configured = true;

  // Only configure internal Neon if no explicit DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    neonConfig.useSecureWebSocket = false;
    neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
    neonConfig.wsProxy = () => `${PROXY_HOST}:${PROXY_WSS_PORT}/v2`;
  }
}

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (_sql) return _sql;
  configure();

  const connectionString =
    process.env.DATABASE_URL ||
    `postgres://postgres:postgres@${PROXY_HOST}:${PROXY_WSS_PORT}/postgres?options=endpoint%3D${encodeURIComponent(BRANCH)}`;

  _sql = neon(connectionString);
  return _sql;
}

export async function ensureSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS hn_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      body TEXT,
      author TEXT NOT NULL DEFAULT 'anon',
      points INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS hn_votes (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES hn_posts(id) ON DELETE CASCADE,
      voter TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, voter)
    )
  `;
}

export type Post = {
  id: number;
  title: string;
  url: string | null;
  body: string | null;
  author: string;
  points: number;
  created_at: string;
};
