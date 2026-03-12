import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const PROXY_HOST =
  process.env.PROXY_HOST ||
  "vpce-0ed6fa2a25f5bbf43-8rl63vdv.vpce-svc-0594e55da659cc7bf.us-west-2.vpce.amazonaws.com";
const PROXY_WSS_PORT = process.env.PROXY_WSS_PORT || "44110";
const BRANCH = process.env.NEON_BRANCH || "branch-mvp";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;

  neonConfig.useSecureWebSocket = false;
  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
  neonConfig.wsProxy = () => `${PROXY_HOST}:${PROXY_WSS_PORT}/v2`;

  const connectionString =
    process.env.DATABASE_URL ||
    `postgres://postgres:postgres@${PROXY_HOST}:${PROXY_WSS_PORT}/postgres?options=endpoint%3D${encodeURIComponent(BRANCH)}`;

  _pool = new Pool({ connectionString });
  return _pool;
}

export async function query(text: string, params?: unknown[]) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS hn_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      body TEXT,
      author TEXT NOT NULL DEFAULT 'anon',
      points INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS hn_votes (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES hn_posts(id) ON DELETE CASCADE,
      voter TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, voter)
    )
  `);
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
