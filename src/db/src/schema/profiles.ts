import { pgTable, text, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  headerImageUrl: text("header_image_url"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  smsNumber: text("sms_number"),
  location: text("location"),
  contactSettings: json("contact_settings").$type<{
    showPhone: boolean;
    showEmail: boolean;
    showWebsite: boolean;
    showSms: boolean;
    showLocation?: boolean;
  }>().notNull().default({ showPhone: true, showEmail: true, showWebsite: true, showSms: false, showLocation: true }),
  themeSettings: json("theme_settings").$type<{
    backgroundColor?: string;
    textColor?: string;
    buttonStyle?: "rounded" | "square" | "outline";
    font?: string;
    layout?: "classic" | "hero";
  }>().notNull().default({}),
  leadCaptureEnabled: boolean("lead_capture_enabled").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  verificationLevel: text("verification_level").notNull().default("none"),
  verifiedAt: timestamp("verified_at"),
  verificationType: text("verification_type").notNull().default("lifetime"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profilesTable);
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
