import { getDb, ensureSchema, type Post } from "@/lib/db";
import Link from "next/link";
import { Feed } from "./feed";

async function getPosts(): Promise<Post[]> {
  const sql = getDb();
  await ensureSchema();
  return (await sql`
    SELECT id, title, url, body, author, points, created_at
    FROM hn_posts ORDER BY points DESC, created_at DESC LIMIT 50
  `) as unknown as Post[];
}

export const dynamic = "force-dynamic";

export default async function Home() {
  let posts: Post[] = [];
  let error: string | null = null;
  try {
    posts = await getPosts();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="bg-[#ff6600] px-3 py-1.5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-bold text-sm border border-white px-1.5 py-0.5 text-white">P</span>
          <span className="font-bold text-sm text-black">PAR Hacker News</span>
        </Link>
        <span className="text-xs text-black/60">internal neon stress test</span>
        <div className="flex-1" />
        <Link href="/submit" className="text-sm text-black hover:underline">submit</Link>
      </header>

      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 m-2 text-sm">
          <p className="font-bold text-red-800">DB Error</p>
          <p className="text-red-600 mt-1 font-mono text-xs">{error}</p>
        </div>
      ) : (
        <Feed posts={posts} />
      )}

      <footer className="text-center text-xs text-gray-400 py-4">
        Powered by internal Neon Postgres on AWS EKS
      </footer>
    </div>
  );
}
