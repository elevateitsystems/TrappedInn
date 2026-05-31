import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, profileModesTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Mode API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const { id } = await params;
    const body = await req.json();
    const cleanData: {
      label?: string;
      emoji?: string;
      displayName?: string;
      bio?: string | null;
      themeSettings?: Record<string, unknown>;
    } = {};

    if (body.label !== undefined) {
      const label = String(body.label).trim();
      if (!label) {
        return NextResponse.json({ error: "Mode name is required" }, { status: 400 });
      }
      cleanData.label = label;
    }

    if (body.emoji !== undefined) {
      cleanData.emoji = String(body.emoji).trim() || "✨";
    }

    if (body.displayName !== undefined) {
      const displayName = String(body.displayName).trim();
      if (!displayName) {
        return NextResponse.json({ error: "Display name is required" }, { status: 400 });
      }
      cleanData.displayName = displayName;
    }

    if (body.bio !== undefined) {
      cleanData.bio = String(body.bio).trim() || null;
    }

    if (body.themeSettings !== undefined && typeof body.themeSettings === "object") {
      cleanData.themeSettings = body.themeSettings;
    }

    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await withRetry(() =>
      db
        .update(profileModesTable)
        .set(cleanData)
        .where(and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)))
        .returning()
    );

    if (!updated) {
      return NextResponse.json({ error: "Mode not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const { id } = await params;
    const [deleted] = await withRetry(() =>
      db
        .delete(profileModesTable)
        .where(and(eq(profileModesTable.id, id), eq(profileModesTable.profileId, profile.id)))
        .returning()
    );
    if (!deleted) {
      return NextResponse.json({ error: "Mode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
