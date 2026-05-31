import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, profileModesTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Mode activate API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const { id } = await params;

    const mode = await withRetry(() =>
      db.query.profileModesTable.findFirst({
        where: and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)),
      })
    );

    if (!mode) {
      return NextResponse.json({ error: "Mode not found" }, { status: 404 });
    }

    await withRetry(() =>
      db
        .update(profileModesTable)
        .set({ isActive: false })
        .where(eq(profileModesTable.profileId, profile.id))
    );

    const [updated] = await withRetry(() =>
      db
        .update(profileModesTable)
        .set({ isActive: true })
        .where(and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)))
        .returning()
    );

    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
