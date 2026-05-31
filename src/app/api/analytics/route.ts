import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, analyticsTable, linksTable, profilesTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Analytics API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function hourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}${suffix}`;
}

export async function GET() {
  try {
    const profile = await getOrCreateCurrentUserProfile();

    const [events, links] = await Promise.all([
      withRetry(() =>
        db.query.analyticsTable.findMany({
          where: eq(analyticsTable.profileId, profile.id),
          orderBy: (analytics, { desc }) => [desc(analytics.createdAt)],
        })
      ),
      withRetry(() =>
        db.query.linksTable.findMany({
          where: eq(linksTable.profileId, profile.id),
        })
      ),
    ]);

    const totalViews = events.filter((event) => event.eventType === "view").length;
    const totalClicks = events.filter((event) => event.eventType === "click").length;
    const totalTaps = events.filter((event) => event.eventType === "tap").length;
    const totalLeads = events.filter((event) => event.eventType === "lead").length;

    const viewsByDayMap = new Map<string, number>();
    const today = new Date();
    for (let offset = 29; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      viewsByDayMap.set(dateKey(day), 0);
    }

    for (const event of events) {
      if (event.eventType !== "view") continue;

      const key = dateKey(new Date(event.createdAt));
      if (viewsByDayMap.has(key)) {
        viewsByDayMap.set(key, (viewsByDayMap.get(key) ?? 0) + 1);
      }
    }

    const linkTitles = new Map(links.map((link) => [link.id, link.title]));
    const linkClickMap = new Map<string, number>();
    const activityByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: hourLabel(hour),
      count: 0,
    }));

    for (const event of events) {
      const hour = new Date(event.createdAt).getHours();
      activityByHour[hour].count += 1;

      if (event.eventType === "click") {
        const linkId = String(event.metadata?.linkId ?? "");
        if (linkId) {
          linkClickMap.set(linkId, (linkClickMap.get(linkId) ?? 0) + 1);
        }
      }
    }

    const topLinks = Array.from(linkClickMap.entries())
      .map(([linkId, clicks]) => ({
        linkId,
        title: linkTitles.get(linkId) ?? "Unknown link",
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const peakHour =
      activityByHour.reduce(
        (peak, hour) => (hour.count > peak.count ? hour : peak),
        activityByHour[0]
      ).count > 0
        ? activityByHour.reduce(
            (peak, hour) => (hour.count > peak.count ? hour : peak),
            activityByHour[0]
          )
        : null;

    return NextResponse.json({
      totalViews,
      totalClicks,
      totalTaps,
      totalLeads,
      conversionRate:
        totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
      viewsByDay: Array.from(viewsByDayMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
      activityByHour,
      peakHour,
      topLinks,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profileId = String(body.profileId ?? "");
    const eventType = String(body.eventType ?? "");
    const metadata =
      body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!profileId || !["view", "click", "tap", "lead"].includes(eventType)) {
      return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });
    }

    const profile = await withRetry(() =>
      db.query.profilesTable.findFirst({
        where: eq(profilesTable.id, profileId),
      })
    );

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { userId } = await auth();
    if (eventType === "view" && userId === profile.userId) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const [created] = await withRetry(() =>
      db
        .insert(analyticsTable)
        .values({
          id: crypto.randomUUID(),
          profileId,
          eventType,
          metadata,
        })
        .returning()
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
