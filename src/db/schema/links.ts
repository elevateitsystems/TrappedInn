import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const linksTable = pgTable("links", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Link = typeof linksTable.$inferSelect;
