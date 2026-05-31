import { NextResponse } from "next/server";
import { db, profileModesTable, withRetry } from "@/db";
import { eq, asc } from "drizzle-orm";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Modes API error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET() {
  try {
    const profile = await getOrCreateCurrentUserProfile();

    const modes = await withRetry(() => db.query.profileModesTable.findMany({
      where: eq(profileModesTable.profileId, profile.id),
      orderBy: [asc(profileModesTable.position)],
    }));

    return NextResponse.json(modes);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const body = await req.json();
    const label = String(body.label ?? "").trim();
    const emoji = String(body.emoji ?? "✨").trim() || "✨";
    const displayName = String(body.displayName ?? "").trim();
    const bio = String(body.bio ?? "").trim() || null;
    const themeSettings =
      body.themeSettings && typeof body.themeSettings === "object"
        ? body.themeSettings
        : {};

    if (!label || !displayName) {
      return NextResponse.json(
        { error: "Mode name and display name are required" },
        { status: 400 }
      );
    }

    const currentModes = await withRetry(() =>
      db.query.profileModesTable.findMany({
        where: eq(profileModesTable.profileId, profile.id),
      })
    );
    const nextPosition =
      currentModes.reduce((max, mode) => Math.max(max, mode.position), -1) + 1;

    const [created] = await withRetry(() =>
      db
        .insert(profileModesTable)
        .values({
          id: crypto.randomUUID(),
          profileId: profile.id,
          label,
          emoji,
          displayName,
          bio,
          themeSettings,
          position: nextPosition,
          isActive: false,
        })
        .returning()
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
