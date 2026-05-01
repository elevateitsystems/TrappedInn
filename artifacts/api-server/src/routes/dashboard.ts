import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, linksTable, cardsTable, connectionsTable, analyticsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });
    if (!profile) {
      res.json({
        profileViews: 0,
        totalLinks: 0,
        totalCards: 0,
        totalConnections: 0,
        nfcTaps: 0,
        linkClicks: 0,
      });
      return;
    }

    const [links, cards, connections, analyticsEvents] = await Promise.all([
      db.query.linksTable.findMany({ where: eq(linksTable.profileId, profile.id) }),
      db.query.cardsTable.findMany({ where: eq(cardsTable.profileId, profile.id) }),
      db.query.connectionsTable.findMany({ where: eq(connectionsTable.userId, userId) }),
      db.query.analyticsTable.findMany({ where: eq(analyticsTable.profileId, profile.id) }),
    ]);

    res.json({
      profileViews: analyticsEvents.filter((e) => e.eventType === "view").length,
      totalLinks: links.length,
      totalCards: cards.length,
      totalConnections: connections.length,
      nfcTaps: analyticsEvents.filter((e) => e.eventType === "tap").length,
      linkClicks: analyticsEvents.filter((e) => e.eventType === "click").length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });
    if (!profile) {
      res.json([]);
      return;
    }
    const events = await db.query.analyticsTable.findMany({
      where: eq(analyticsTable.profileId, profile.id),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: 20,
    });
    res.json(events);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
