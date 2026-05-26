import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, profilesTable, analyticsTable } from "@/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });

    if (!profile) {
      return NextResponse.json([]);
    }

    const events = await db.query.analyticsTable.findMany({
      where: eq(analyticsTable.profileId, profile.id),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: 20,
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("Failed to get recent activity", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
