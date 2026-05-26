import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const cardsTable = pgTable("cards", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  nfcUid: text("nfc_uid"),
  redirectUrl: text("redirect_url").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Card = typeof cardsTable.$inferSelect;
