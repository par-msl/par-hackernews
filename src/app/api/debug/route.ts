import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query("SELECT 1 as ok");
    return NextResponse.json({ connected: true, rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    return NextResponse.json({ connected: false, error: msg, stack, raw: JSON.stringify(e, Object.getOwnPropertyNames(e as object)) }, { status: 500 });
  }
}
