import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, linksTable, usersTable, profileModesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

async function ensureUserAndProfile(userId: string, email?: string) {
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
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
      contactSettings: { showPhone: true, showEmail: true, showWebsite: true, showSms: false },
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
    const data = parsed.data as any;
    const updated = await db.update(profilesTable)
      .set({
        ...(data.username !== undefined && { username: data.username }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.headerImageUrl !== undefined && { headerImageUrl: data.headerImageUrl }),
        ...(data.themeSettings !== undefined && { themeSettings: data.themeSettings }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.smsNumber !== undefined && { smsNumber: data.smsNumber }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.contactSettings !== undefined && { contactSettings: data.contactSettings }),
        ...(data.leadCaptureEnabled !== undefined && { leadCaptureEnabled: data.leadCaptureEnabled }),
        // SECURITY: verified / verificationLevel are intentionally NOT writable here.
        // Verification is admin-managed only (manual approval after Shopify purchase).
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

    // Block suspended / disabled accounts from being viewed publicly
    const owner = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, profile.userId),
    });
    if (owner && owner.accountStatus !== "active") {
      res.status(403).json({ error: "This profile is unavailable." });
      return;
    }

    const links = await db.query.linksTable.findMany({
      where: eq(linksTable.profileId, profile.id),
      orderBy: (l, { asc }) => [asc(l.position)],
    });

    const activeMode = await db.query.profileModesTable.findFirst({
      where: eq(profileModesTable.profileId, profile.id),
      orderBy: (m, { desc }) => [desc(m.isActive)],
    }).then((m) => (m?.isActive ? m : null));

    const publicProfile = {
      ...profile,
      links,
      activeMode: activeMode ? {
        id: activeMode.id,
        label: activeMode.label,
        emoji: activeMode.emoji,
        displayName: activeMode.displayName,
        bio: activeMode.bio,
        themeSettings: activeMode.themeSettings,
      } : null,
      displayName: activeMode?.displayName ?? profile.displayName,
      bio: activeMode?.bio ?? profile.bio,
      themeSettings: activeMode?.themeSettings && Object.keys(activeMode.themeSettings).length > 0
        ? activeMode.themeSettings
        : profile.themeSettings,
    };

    res.json(publicProfile);
  } catch (err) {
    req.log.error({ err }, "Failed to get public profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
