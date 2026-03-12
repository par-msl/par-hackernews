import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PAR Hacker News",
  description: "Internal HN clone on Neon Postgres",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f6ef] antialiased">{children}</body>
    </html>
  );
}
