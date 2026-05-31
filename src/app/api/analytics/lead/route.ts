import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { analyticsTable, db, profilesTable, withRetry } from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profileId = String(body.profileId ?? "");
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!profileId || !email) {
      return NextResponse.json({ error: "Profile and email are required" }, { status: 400 });
    }

    const profile = await withRetry(() =>
      db.query.profilesTable.findFirst({
        where: eq(profilesTable.id, profileId),
      })
    );

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [created] = await withRetry(() =>
      db
        .insert(analyticsTable)
        .values({
          id: crypto.randomUUID(),
          profileId,
          eventType: "lead",
          metadata: { name, email },
        })
        .returning()
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to capture lead", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
