import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, profileModesTable, profilesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { randomUUID } from "crypto";

const router = Router();

async function getProfileForUser(userId: string) {
  return db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, userId),
  });
}

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    const modes = await db.query.profileModesTable.findMany({
      where: eq(profileModesTable.profileId, profile.id),
      orderBy: (m, { asc }) => [asc(m.position)],
    });
    res.json(modes);
  } catch (err) {
    req.log.error({ err }, "Failed to get modes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { label, emoji, displayName, bio, themeSettings } = req.body as any;
  if (!label || !displayName) {
    res.status(400).json({ error: "label and displayName are required" }); return;
  }
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

    const existingModes = await db.query.profileModesTable.findMany({
      where: eq(profileModesTable.profileId, profile.id),
    });

    const rows = await db.insert(profileModesTable).values({
      id: randomUUID(),
      profileId: profile.id,
      label,
      emoji: emoji ?? "✨",
      displayName,
      bio: bio ?? null,
      themeSettings: themeSettings ?? {},
      position: existingModes.length,
      isActive: false,
    }).returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create mode");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = req.params.id as string;
  const { label, emoji, displayName, bio, themeSettings } = req.body as any;
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

    const mode = await db.query.profileModesTable.findFirst({
      where: and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)),
    });
    if (!mode) { res.status(404).json({ error: "Mode not found" }); return; }

    const updated = await db.update(profileModesTable).set({
      ...(label !== undefined && { label }),
      ...(emoji !== undefined && { emoji }),
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(themeSettings !== undefined && { themeSettings }),
    }).where(eq(profileModesTable.id, id)).returning();
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update mode");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = req.params.id as string;
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

    const mode = await db.query.profileModesTable.findFirst({
      where: and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)),
    });
    if (!mode) { res.status(404).json({ error: "Mode not found" }); return; }

    if (mode.isActive) {
      await db.update(profileModesTable)
        .set({ isActive: false })
        .where(eq(profileModesTable.id, id));
    }
    await db.delete(profileModesTable).where(eq(profileModesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete mode");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/activate", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = req.params.id as string;
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

    const mode = await db.query.profileModesTable.findFirst({
      where: and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)),
    });
    if (!mode) { res.status(404).json({ error: "Mode not found" }); return; }

    await db.update(profileModesTable)
      .set({ isActive: false })
      .where(eq(profileModesTable.profileId, profile.id));

    const updated = await db.update(profileModesTable)
      .set({ isActive: true })
      .where(eq(profileModesTable.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to activate mode");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/deactivate", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profile = await getProfileForUser(userId);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

    await db.update(profileModesTable)
      .set({ isActive: false })
      .where(eq(profileModesTable.profileId, profile.id));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to deactivate modes");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
