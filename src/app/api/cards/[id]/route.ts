import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cardsTable, db, profilesTable, withRetry } from "@/db";

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
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const profile = await withRetry(() =>
      db.query.profilesTable.findFirst({
        where: eq(profilesTable.id, card.profileId),
      })
    );

    return NextResponse.json({
      ...card,
      profile,
    });
  } catch (error) {
    console.error("Failed to fetch card", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
