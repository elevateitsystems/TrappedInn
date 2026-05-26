import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, linksTable, profilesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { CreateLinkBody, UpdateLinkBody, ReorderLinksBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

async function getProfileId(userId: string): Promise<string | null> {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, userId),
  });
  return profile?.id ?? null;
}

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profileId = await getProfileId(userId);
    if (!profileId) {
      res.json([]);
      return;
    }
    const links = await db.query.linksTable.findMany({
      where: eq(linksTable.profileId, profileId),
      orderBy: [asc(linksTable.position)],
    });
    res.json(links);
  } catch (err) {
    req.log.error({ err }, "Failed to get links");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const profileId = await getProfileId(userId);
    if (!profileId) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const existing = await db.query.linksTable.findMany({
      where: eq(linksTable.profileId, profileId),
    });
    const position = parsed.data.position ?? existing.length;
    const rows = await db.insert(linksTable).values({
      id: randomUUID(),
      profileId,
      title: parsed.data.title,
      url: parsed.data.url,
      position,
    }).returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create link");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/reorder", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = ReorderLinksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const profileId = await getProfileId(userId);
    if (!profileId) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const updates = parsed.data.linkIds.map((id, idx) =>
      db.update(linksTable).set({ position: idx }).where(eq(linksTable.id, id)).returning()
    );
    const results = await Promise.all(updates);
    res.json(results.flat());
  } catch (err) {
    req.log.error({ err }, "Failed to reorder links");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res): Promise<void> => {
  const id = req.params.id as string;
  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const data = parsed.data;
    const updated = await db.update(linksTable)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.position !== undefined && { position: data.position }),
      })
      .where(eq(linksTable.id, id))
      .returning();
    if (!updated.length) {
      res.status(404).json({ error: "Link not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update link");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res): Promise<void> => {
  const id = req.params.id as string;
  try {
    await db.delete(linksTable).where(eq(linksTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete link");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
