import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const verificationOrdersTable = pgTable("verification_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  username: text("username"),
  email: text("email"),
  tier: text("tier").notNull(),
  status: text("status").notNull().default("pending"),
  source: text("source").notNull().default("manual"),
  externalOrderId: text("external_order_id"),
  amountCents: text("amount_cents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
});

export const adminActivityLogTable = pgTable("admin_activity_log", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVerificationOrderSchema = createInsertSchema(verificationOrdersTable);
export type InsertVerificationOrder = z.infer<typeof insertVerificationOrderSchema>;
export type VerificationOrder = typeof verificationOrdersTable.$inferSelect;

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogTable);
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
export type AdminActivityLog = typeof adminActivityLogTable.$inferSelect;
