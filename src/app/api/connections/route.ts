import { NextResponse } from "next/server";
import { db, connectionsTable, withRetry } from "@/db";

export async function GET() {
  try {
    const list = await withRetry(() => db.query.connectionsTable.findMany());
    return NextResponse.json(list);
  } catch (err) {
    console.error("Failed to fetch connections", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
