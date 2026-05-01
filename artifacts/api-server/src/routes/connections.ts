import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, connectionsTable, profilesTable, linksTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { randomUUID } from "crypto";

const router = Router();

async function getPublicProfile(userId: string) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, userId),
  });
  if (!profile) return null;
  const links = await db.query.linksTable.findMany({
    where: eq(linksTable.profileId, profile.id),
    orderBy: (l, { asc }) => [asc(l.position)],
  });
  return { ...profile, links };
}

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const connections = await db.query.connectionsTable.findMany({
      where: eq(connectionsTable.userId, userId),
    });
    const withProfiles = await Promise.all(
      connections.map(async (conn) => {
        const connectedProfile = await getPublicProfile(conn.connectedUserId);
        return { ...conn, connectedProfile };
      })
    );
    res.json(withProfiles.filter((c) => c.connectedProfile !== null));
  } catch (err) {
    req.log.error({ err }, "Failed to get connections");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:userId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { userId: connectedUserId } = req.params;
  try {
    const existing = await db.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.userId, userId),
        eq(connectionsTable.connectedUserId, connectedUserId),
      ),
    });
    if (existing) {
      const connectedProfile = await getPublicProfile(connectedUserId);
      res.status(201).json({ ...existing, connectedProfile });
      return;
    }
    const connectedProfile = await getPublicProfile(connectedUserId);
    if (!connectedProfile) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const rows = await db.insert(connectionsTable).values({
      id: randomUUID(),
      userId,
      connectedUserId,
    }).returning();
    res.status(201).json({ ...rows[0], connectedProfile });
  } catch (err) {
    req.log.error({ err }, "Failed to create connection");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { userId: connectedUserId } = req.params;
  try {
    await db.delete(connectionsTable).where(
      and(
        eq(connectionsTable.userId, userId),
        eq(connectionsTable.connectedUserId, connectedUserId),
      )
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete connection");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
