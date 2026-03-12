"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url: url || null, body: body || null, author: "anon" }),
    });
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="bg-[#ff6600] px-3 py-1.5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-bold text-sm border border-white px-1.5 py-0.5 text-white">P</span>
          <span className="font-bold text-sm text-black">PAR Hacker News</span>
        </Link>
      </header>
      <div className="bg-[#f6f6ef] p-4">
        <form onSubmit={submit} className="space-y-3 max-w-lg">
          <div>
            <label className="block text-sm mb-1">title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-300 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">url</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">or text</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full border border-gray-300 px-2 py-1 text-sm" />
          </div>
          <button type="submit" disabled={busy} className="bg-[#ff6600] text-white px-4 py-1 text-sm cursor-pointer">
            {busy ? "submitting..." : "submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
