import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, adminActivityLogTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { requireAuth, getUserId } from "./auth";

export const requireAdmin = [
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req);
    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
      });
      if (!user || !user.isAdmin) {
        res.status(403).json({ error: "Forbidden: admin access required" });
        return;
      }
      (req as any).adminUser = user;
      next();
    } catch (err) {
      req.log.error({ err }, "Admin auth check failed");
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(adminActivityLogTable).values({
      id: randomUUID(),
      adminUserId,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // Never let logging break the action
  }
}
