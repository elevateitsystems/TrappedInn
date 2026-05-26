import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, profilesTable, linksTable, cardsTable, connectionsTable, analyticsTable, withRetry } from "@/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await withRetry(() => db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    }));

    if (!profile) {
      return NextResponse.json({
        profileViews: 0,
        totalLinks: 0,
        totalCards: 0,
        totalConnections: 0,
        nfcTaps: 0,
        linkClicks: 0,
      });
    }

    const links = await withRetry(() => db.query.linksTable.findMany({ where: eq(linksTable.profileId, profile.id) }));
    const cards = await withRetry(() => db.query.cardsTable.findMany({ where: eq(cardsTable.profileId, profile.id) }));
    const connections = await withRetry(() => db.query.connectionsTable.findMany({ where: eq(connectionsTable.userId, userId) }));
    const analyticsEvents = await withRetry(() => db.query.analyticsTable.findMany({ where: eq(analyticsTable.profileId, profile.id) }));

    return NextResponse.json({
      profileViews: analyticsEvents.filter((e) => e.eventType === "view").length,
      totalLinks: links.length,
      totalCards: cards.length,
      totalConnections: connections.length,
      nfcTaps: analyticsEvents.filter((e) => e.eventType === "tap").length,
      linkClicks: analyticsEvents.filter((e) => e.eventType === "click").length,
    });
  } catch (err) {
    console.error("Failed to get dashboard summary", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
