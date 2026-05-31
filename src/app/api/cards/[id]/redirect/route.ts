import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { analyticsTable, cardsTable, db, profilesTable, withRetry } from "@/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = await withRetry(() =>
      db.query.cardsTable.findFirst({
        where: eq(cardsTable.id, id),
      })
    );

    if (!card) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const profile = await withRetry(() =>
      db.query.profilesTable.findFirst({
        where: eq(profilesTable.id, card.profileId),
      })
    );

    if (!profile) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    await withRetry(() =>
      db.insert(analyticsTable).values({
        id: crypto.randomUUID(),
        profileId: profile.id,
        eventType: "tap",
        metadata: { cardId: card.id },
      })
    );

    return NextResponse.redirect(new URL(`/p/${profile.username}`, req.url));
  } catch (error) {
    console.error("Failed to redirect card", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
