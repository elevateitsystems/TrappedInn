import { pgTable, text, timestamp, json, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const profileModesTable = pgTable("profile_modes", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  emoji: text("emoji").notNull().default("✨"),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  themeSettings: json("theme_settings").$type<{
    backgroundColor?: string;
    textColor?: string;
    buttonStyle?: "rounded" | "square" | "outline";
    font?: string;
    layout?: "classic" | "hero";
  }>().notNull().default({}),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileModeSchema = createInsertSchema(profileModesTable);
export type InsertProfileMode = z.infer<typeof insertProfileModeSchema>;
export type ProfileMode = typeof profileModesTable.$inferSelect;
