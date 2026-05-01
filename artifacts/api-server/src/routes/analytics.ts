import { Router } from "express";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { db, analyticsTable, linksTable } from "@workspace/db";
import { TrackEventBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.post("/track", async (req, res): Promise<void> => {
  const parsed = TrackEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    await db.insert(analyticsTable).values({
      id: randomUUID(),
      profileId: parsed.data.profileId,
      eventType: parsed.data.eventType,
      metadata: (parsed.data.metadata as Record<string, unknown>) ?? {},
    });
    res.status(201).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to track event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile/:profileId", async (req, res): Promise<void> => {
  const { profileId } = req.params;
  try {
    const allEvents = await db.query.analyticsTable.findMany({
      where: eq(analyticsTable.profileId, profileId),
    });

    const totalViews = allEvents.filter((e) => e.eventType === "view").length;
    const totalClicks = allEvents.filter((e) => e.eventType === "click").length;
    const totalTaps = allEvents.filter((e) => e.eventType === "tap").length;

    // Views by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewEvents = allEvents.filter(
      (e) => e.eventType === "view" && e.createdAt >= thirtyDaysAgo
    );

    const dayCountMap: Record<string, number> = {};
    for (const e of viewEvents) {
      const date = e.createdAt.toISOString().slice(0, 10);
      dayCountMap[date] = (dayCountMap[date] ?? 0) + 1;
    }
    const viewsByDay = Object.entries(dayCountMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top links by click (metadata.linkId)
    const clickEvents = allEvents.filter((e) => e.eventType === "click");
    const linkClickMap: Record<string, number> = {};
    for (const e of clickEvents) {
      const meta = e.metadata as Record<string, unknown>;
      const linkId = typeof meta?.linkId === "string" ? meta.linkId : null;
      if (linkId) {
        linkClickMap[linkId] = (linkClickMap[linkId] ?? 0) + 1;
      }
    }

    const topLinks = await Promise.all(
      Object.entries(linkClickMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([linkId, clicks]) => {
          const link = await db.query.linksTable.findFirst({
            where: eq(linksTable.id, linkId),
          });
          return { linkId, title: link?.title ?? "Unknown", clicks };
        })
    );

    res.json({ totalViews, totalClicks, totalTaps, viewsByDay, topLinks });
  } catch (err) {
    req.log.error({ err }, "Failed to get analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
