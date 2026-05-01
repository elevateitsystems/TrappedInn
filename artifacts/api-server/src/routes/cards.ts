import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, cardsTable, profilesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { CreateCardBody } from "@workspace/api-zod";
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
    const cards = await db.query.cardsTable.findMany({
      where: eq(cardsTable.profileId, profileId),
    });
    res.json(cards);
  } catch (err) {
    req.log.error({ err }, "Failed to get cards");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateCardBody.safeParse(req.body);
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
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, profileId),
    });
    const cardId = randomUUID();
    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "https://tappedinn.net";
    const redirectUrl = `${baseUrl}/card/${cardId}`;
    const rows = await db.insert(cardsTable).values({
      id: cardId,
      profileId,
      nfcUid: parsed.data.nfcUid ?? null,
      redirectUrl,
      label: parsed.data.label ?? null,
    }).returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create card");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    const card = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, id),
    });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json(card);
  } catch (err) {
    req.log.error({ err }, "Failed to get card");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    await db.delete(cardsTable).where(eq(cardsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete card");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/redirect", async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    const card = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, id),
    });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, card.profileId),
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.redirect(302, `/p/${profile.username}`);
  } catch (err) {
    req.log.error({ err }, "Failed to redirect card");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
