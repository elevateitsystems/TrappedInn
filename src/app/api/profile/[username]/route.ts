import { NextResponse } from "next/server";
import { db, profilesTable, linksTable, profileModesTable, withRetry } from "@/db";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const profile = await withRetry(() => db.query.profilesTable.findFirst({
      where: eq(profilesTable.username, username),
    }));

    // Increment view count if the column exists
    if (profile && "viewCount" in profile) {
      await withRetry(() =>
        db
          .update(profilesTable)
          .set({ viewCount: (profile as any).viewCount + 1 })
          .where(eq(profilesTable.id, profile.id))
      );
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const links = await withRetry(() => db.query.linksTable.findMany({
      where: eq(linksTable.profileId, profile.id),
      orderBy: [asc(linksTable.position)],
    }));

    const modes = await withRetry(() => db.query.profileModesTable.findMany({
      where: and(
        eq(profileModesTable.profileId, profile.id),
        eq(profileModesTable.isActive, true)
      ),
    }));

    const activeMode = modes.length > 0 ? modes[0] : null;

    return NextResponse.json({
      ...profile,
      links,
      activeMode,
    });
  } catch (err) {
    console.error("Failed to fetch public profile", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
