import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const analyticsTable = pgTable("analytics", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Analytics = typeof analyticsTable.$inferSelect;
