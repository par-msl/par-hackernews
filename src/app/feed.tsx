"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Post } from "@/lib/db";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

function host(url: string | null) {
  if (!url) return null;
  try { return new URL(url).hostname.replace("www.", ""); } catch { return null; }
}

export function Feed({ posts }: { posts: Post[] }) {
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const router = useRouter();

  async function vote(postId: number) {
    if (voted.has(postId)) return;
    setVoted((v) => new Set(v).add(postId));
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, voter: "user-" + Math.random().toString(36).slice(2, 8) }),
    });
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        No posts yet. <Link href="/submit" className="underline">Submit the first one!</Link>
      </div>
    );
  }

  return (
    <ol className="list-none py-2">
      {posts.map((post, i) => (
        <li key={post.id} className="flex items-baseline px-2 py-0.5 hover:bg-[#f0f0e8]">
          <span className="text-gray-400 text-xs w-7 text-right mr-1 shrink-0">{i + 1}.</span>
          <button
            onClick={() => vote(post.id)}
            disabled={voted.has(post.id)}
            className={"shrink-0 mr-1 text-xs cursor-pointer leading-none " +
              (voted.has(post.id) ? "text-[#ff6600]" : "text-gray-400 hover:text-[#ff6600]")}
          >&#9650;</button>
          <div className="min-w-0">
            <div className="text-[13px]">
              {post.url ? (
                <a href={post.url} className="text-black hover:underline" target="_blank" rel="noopener">{post.title}</a>
              ) : (
                <span className="text-black">{post.title}</span>
              )}
              {post.url && <span className="text-[11px] text-gray-400 ml-1">({host(post.url)})</span>}
            </div>
            <div className="text-[11px] text-gray-500">
              {post.points} point{post.points !== 1 && "s"} by {post.author} {timeAgo(post.created_at)} ago
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
