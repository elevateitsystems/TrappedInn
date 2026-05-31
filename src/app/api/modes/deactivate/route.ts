import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, profileModesTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Mode deactivate API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST() {
  try {
    const profile = await getOrCreateCurrentUserProfile();

    await withRetry(() =>
      db
        .update(profileModesTable)
        .set({ isActive: false })
        .where(eq(profileModesTable.profileId, profile.id))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
