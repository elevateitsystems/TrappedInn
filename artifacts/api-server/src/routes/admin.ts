import { Router, type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { eq, desc, ilike, or, sql, and, gte } from "drizzle-orm";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import {
  db,
  usersTable,
  profilesTable,
  verificationOrdersTable,
  adminActivityLogTable,
  analyticsTable,
  linksTable,
} from "@workspace/db";
import { requireAdmin, logAdminAction } from "../lib/admin-auth";
import { getUserId, requireAuth } from "../lib/auth";

const router = Router();

// Rate limit all admin endpoints (per-IP). Generous on reads, strict on writes.
const adminReadLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const adminWriteLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Lightweight CSRF defense for cookie-auth admin writes: require Origin or
// Referer to match the request's Host. Same-origin XHR (from the admin SPA)
// always sends these; cross-origin attackers either cannot set them or they
// won't match.
function sameOriginRequired(req: Request, res: Response, next: NextFunction): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }
  const host = req.get("host");
  const originHeader = req.get("origin") ?? req.get("referer");
  if (!originHeader || !host) {
    res.status(403).json({ error: "Origin required for admin write" });
    return;
  }
  try {
    const url = new URL(originHeader);
    if (url.host !== host) {
      res.status(403).json({ error: "Cross-origin admin writes are blocked" });
      return;
    }
  } catch {
    res.status(403).json({ error: "Invalid Origin header" });
    return;
  }
  next();
}

router.use(adminReadLimit);
router.use(sameOriginRequired);
router.use((req, _res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    adminWriteLimit(req, _res, next);
  } else {
    next();
  }
});

const VERIFICATION_LEVELS = ["none", "blue", "gold", "elite_black"] as const;
const ACCOUNT_STATUSES = ["active", "suspended", "disabled"] as const;
const ORDER_STATUSES = ["pending", "approved", "rejected", "refunded"] as const;

// Whoami — used by frontend to determine if current user has admin access.
// Available to any signed-in user; returns isAdmin boolean.
router.get("/whoami", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });
    res.json({ isAdmin: !!user?.isAdmin });
  } catch (err) {
    req.log.error({ err }, "Failed admin whoami");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dashboard stats
router.get("/stats", ...requireAdmin, async (req, res): Promise<void> => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      userCountRow,
      profileCountRow,
      verifiedCountRow,
      pendingOrdersRow,
      newSignupsRow,
      tapsRow,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(profilesTable),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(profilesTable)
        .where(sql`${profilesTable.verificationLevel} != 'none'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(verificationOrdersTable)
        .where(eq(verificationOrdersTable.status, "pending")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(usersTable)
        .where(gte(usersTable.createdAt, since)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(analyticsTable)
        .where(and(eq(analyticsTable.eventType, "tap"), gte(analyticsTable.createdAt, since))),
    ]);

    res.json({
      totalUsers: userCountRow[0]?.count ?? 0,
      totalProfiles: profileCountRow[0]?.count ?? 0,
      verifiedUsers: verifiedCountRow[0]?.count ?? 0,
      pendingOrders: pendingOrdersRow[0]?.count ?? 0,
      newSignups7d: newSignupsRow[0]?.count ?? 0,
      taps7d: tapsRow[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// List users (search + pagination)
const listUsersQuery = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(ACCOUNT_STATUSES).optional(),
  verification: z.enum(VERIFICATION_LEVELS).optional(),
});

router.get("/users", ...requireAdmin, async (req, res): Promise<void> => {
  const parsed = listUsersQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, limit, offset, status, verification } = parsed.data;
  try {
    const filters = [];
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      filters.push(
        or(
          ilike(usersTable.email, term),
          ilike(profilesTable.username, term),
          ilike(profilesTable.displayName, term),
        )!,
      );
    }
    if (status) filters.push(eq(usersTable.accountStatus, status));
    if (verification) filters.push(eq(profilesTable.verificationLevel, verification));

    const where = filters.length ? and(...filters) : undefined;

    const rows = await db
      .select({
        userId: usersTable.id,
        email: usersTable.email,
        isAdmin: usersTable.isAdmin,
        accountStatus: usersTable.accountStatus,
        createdAt: usersTable.createdAt,
        profileId: profilesTable.id,
        username: profilesTable.username,
        displayName: profilesTable.displayName,
        avatarUrl: profilesTable.avatarUrl,
        verificationLevel: profilesTable.verificationLevel,
        verifiedAt: profilesTable.verifiedAt,
        verificationType: profilesTable.verificationType,
      })
      .from(usersTable)
      .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
      .where(where)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalRow = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
      .where(where);

    res.json({
      users: rows,
      total: totalRow[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Failed list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Recent signups
router.get("/signups", ...requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
      username: profilesTable.username,
      displayName: profilesTable.displayName,
      verificationLevel: profilesTable.verificationLevel,
    })
    .from(usersTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
    .orderBy(desc(usersTable.createdAt))
    .limit(15);
  res.json({ signups: rows });
});

// User detail
router.get("/users/:userId", ...requireAdmin, async (req, res): Promise<void> => {
  const userId = req.params.userId as string;
  try {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });
    const links = profile
      ? await db.query.linksTable.findMany({ where: eq(linksTable.profileId, profile.id) })
      : [];
    const tapCountRow = profile
      ? await db
          .select({ count: sql<number>`count(*)::int` })
          .from(analyticsTable)
          .where(eq(analyticsTable.profileId, profile.id))
      : [{ count: 0 }];
    res.json({ user, profile, links, tapCount: tapCountRow[0]?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed user detail");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update verification
const updateVerificationBody = z.object({
  verificationLevel: z.enum(VERIFICATION_LEVELS),
  verificationType: z.string().optional().default("lifetime"),
});

router.put("/users/:userId/verification", ...requireAdmin, async (req, res): Promise<void> => {
  const adminId = getUserId(req);
  const userId = req.params.userId as string;
  const parsed = updateVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { verificationLevel, verificationType } = parsed.data;
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const verifiedAt = verificationLevel === "none" ? null : new Date();
    const updated = await db
      .update(profilesTable)
      .set({
        verificationLevel,
        verificationType,
        verifiedAt,
        verified: verificationLevel !== "none",
      })
      .where(eq(profilesTable.id, profile.id))
      .returning();
    await logAdminAction(adminId, "verification.update", "user", userId, {
      from: profile.verificationLevel,
      to: verificationLevel,
      type: verificationType,
    });
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed update verification");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update account status
const updateStatusBody = z.object({ accountStatus: z.enum(ACCOUNT_STATUSES) });

router.put("/users/:userId/status", ...requireAdmin, async (req, res): Promise<void> => {
  const adminId = getUserId(req);
  const userId = req.params.userId as string;
  const parsed = updateStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.isAdmin && parsed.data.accountStatus !== "active") {
      res.status(400).json({ error: "Cannot suspend or disable an admin" });
      return;
    }
    const updated = await db
      .update(usersTable)
      .set({ accountStatus: parsed.data.accountStatus })
      .where(eq(usersTable.id, userId))
      .returning();
    await logAdminAction(adminId, "user.status", "user", userId, {
      from: user.accountStatus,
      to: parsed.data.accountStatus,
    });
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed update status");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Grant / revoke admin (only existing admins can do this)
const updateAdminBody = z.object({ isAdmin: z.boolean() });

router.put("/users/:userId/admin", ...requireAdmin, async (req, res): Promise<void> => {
  const adminId = getUserId(req);
  const userId = req.params.userId as string;
  const parsed = updateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    // Transactional last-admin safeguard: enforce inside a tx so two concurrent
    // demotions can't both pass the count check.
    const updated = await db.transaction(async (tx) => {
      if (!parsed.data.isAdmin) {
        const adminCountRow = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(usersTable)
          .where(eq(usersTable.isAdmin, true));
        if ((adminCountRow[0]?.count ?? 0) <= 1) {
          throw new Error("LAST_ADMIN");
        }
      }
      return tx
        .update(usersTable)
        .set({ isAdmin: parsed.data.isAdmin })
        .where(eq(usersTable.id, userId))
        .returning();
    });
    if (!updated[0]) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await logAdminAction(adminId, "user.admin", "user", userId, { isAdmin: parsed.data.isAdmin });
    res.json(updated[0]);
  } catch (err) {
    if (err instanceof Error && err.message === "LAST_ADMIN") {
      res.status(400).json({ error: "Cannot remove the last admin" });
      return;
    }
    req.log.error({ err }, "Failed update admin flag");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ──────────────────────────────────────────────────────────────────
// Verification orders
// ──────────────────────────────────────────────────────────────────

router.get("/orders", ...requireAdmin, async (req, res): Promise<void> => {
  const parsed = z
    .object({ status: z.enum(ORDER_STATUSES).optional() })
    .safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const where = parsed.data.status
    ? eq(verificationOrdersTable.status, parsed.data.status)
    : undefined;
  const rows = await db
    .select()
    .from(verificationOrdersTable)
    .where(where)
    .orderBy(desc(verificationOrdersTable.createdAt))
    .limit(200);
  res.json({ orders: rows });
});

const createOrderBody = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  tier: z.enum(["blue", "gold", "elite_black"]),
  externalOrderId: z.string().optional(),
  amountCents: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional().default("manual"),
});

router.post("/orders", ...requireAdmin, async (req, res): Promise<void> => {
  const adminId = getUserId(req);
  const parsed = createOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  try {
    // Try to match to a user
    let userId: string | null = null;
    if (d.username) {
      const p = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.username, d.username),
      });
      userId = p?.userId ?? null;
    }
    if (!userId && d.email) {
      const u = await db.query.usersTable.findFirst({ where: eq(usersTable.email, d.email) });
      userId = u?.id ?? null;
    }

    const id = randomUUID();
    const rows = await db
      .insert(verificationOrdersTable)
      .values({
        id,
        userId,
        username: d.username ?? null,
        email: d.email ?? null,
        tier: d.tier,
        status: "pending",
        source: d.source ?? "manual",
        externalOrderId: d.externalOrderId ?? null,
        amountCents: d.amountCents ?? null,
        notes: d.notes ?? null,
      })
      .returning();
    await logAdminAction(adminId, "order.create", "order", id, { tier: d.tier });
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateOrderBody = z.object({
  status: z.enum(ORDER_STATUSES),
  applyVerification: z.boolean().optional().default(false),
});

router.put("/orders/:orderId", ...requireAdmin, async (req, res): Promise<void> => {
  const adminId = getUserId(req);
  const orderId = req.params.orderId as string;
  const parsed = updateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const order = await db.query.verificationOrdersTable.findFirst({
      where: eq(verificationOrdersTable.id, orderId),
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const updated = await db
      .update(verificationOrdersTable)
      .set({
        status: parsed.data.status,
        approvedAt: parsed.data.status === "approved" ? new Date() : order.approvedAt,
        approvedBy: parsed.data.status === "approved" ? adminId : order.approvedBy,
      })
      .where(eq(verificationOrdersTable.id, orderId))
      .returning();

    // Auto-apply verification if requested + approved
    if (parsed.data.status === "approved" && parsed.data.applyVerification && order.userId) {
      const profile = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.userId, order.userId),
      });
      if (profile) {
        await db
          .update(profilesTable)
          .set({
            verificationLevel: order.tier,
            verificationType: "lifetime",
            verifiedAt: new Date(),
            verified: true,
          })
          .where(eq(profilesTable.id, profile.id));
        await logAdminAction(adminId, "verification.update", "user", order.userId, {
          to: order.tier,
          viaOrder: orderId,
        });
      }
    }

    await logAdminAction(adminId, "order.update", "order", orderId, {
      to: parsed.data.status,
    });
    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Failed update order");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Activity log
router.get("/activity", ...requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(adminActivityLogTable)
    .orderBy(desc(adminActivityLogTable.createdAt))
    .limit(100);
  res.json({ activity: rows });
});

export default router;
