import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, linksTable, usersTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

async function ensureUserAndProfile(userId: string, email?: string) {
  let user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  if (!user) {
    await db.insert(usersTable).values({
      id: userId,
      email: email ?? `${userId}@tappedinnnetwork.local`,
    });
  }

  let profile = await db.query.profilesTable.findFirst({ where: eq(profilesTable.userId, userId) });
  if (!profile) {
    const username = `user_${userId.slice(0, 8)}`;
    const id = randomUUID();
    const rows = await db.insert(profilesTable).values({
      id,
      userId,
      username,
      displayName: "New User",
      themeSettings: {},
      contactSettings: { showPhone: true, showEmail: true, showWebsite: true },
    }).returning();
    profile = rows[0];
  }
  return profile;
}

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const profile = await ensureUserAndProfile(userId);
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const profile = await ensureUserAndProfile(userId);
    const data = parsed.data;
    const updated = await db.update(profilesTable)
      .set({
        ...(data.username !== undefined && { username: data.username }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.themeSettings !== undefined && { themeSettings: data.themeSettings as Record<string, unknown> }),
        ...((data as any).phone !== undefined && { phone: (data as any).phone }),
        ...((data as any).email !== undefined && { email: (data as any).email }),
        ...((data as any).website !== undefined && { website: (data as any).website }),
        ...((data as any).contactSettings !== undefined && { contactSettings: (data as any).contactSettings }),
      })
      .where(eq(profilesTable.id, profile.id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:username", async (req, res): Promise<void> => {
  const { username } = req.params;
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.username, username),
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const links = await db.query.linksTable.findMany({
      where: eq(linksTable.profileId, profile.id),
      orderBy: (l, { asc }) => [asc(l.position)],
    });
    res.json({ ...profile, links });
  } catch (err) {
    req.log.error({ err }, "Failed to get public profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
