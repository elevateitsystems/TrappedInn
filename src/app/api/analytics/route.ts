import { NextResponse } from "next/server";
import { db, analyticsTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // The client sometimes sends the UUID as a query‑string key, e.g. /api/analytics?bfeb09c3-7b9d-...=
    const id = url.searchParams.keys().next().value;
    if (!id) {
      return NextResponse.json({ error: "Missing analytics id" }, { status: 400 });
    }

    const record = await withRetry(() =>
      db.query.analyticsTable.findFirst({ where: eq(analyticsTable.id, id) })
    );

    if (!record) {
      return NextResponse.json({ error: "Analytics record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("Analytics fetch error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
