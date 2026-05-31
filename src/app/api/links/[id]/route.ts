import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, linksTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Link API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  new URL(withProtocol);
  return withProtocol;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const { id } = await params;
    const body = await req.json();
    const cleanData: { title?: string; url?: string } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      cleanData.title = title;
    }

    if (body.url !== undefined) {
      try {
        cleanData.url = normalizeUrl(String(body.url));
      } catch {
        return NextResponse.json({ error: "Enter a valid URL" }, { status: 400 });
      }
    }

    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await withRetry(() =>
      db
        .update(linksTable)
        .set(cleanData)
        .where(and(eq(linksTable.id, id), eq(linksTable.profileId, profile.id)))
        .returning()
    );

    if (!updated) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
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
        .delete(linksTable)
        .where(and(eq(linksTable.id, id), eq(linksTable.profileId, profile.id)))
        .returning()
    );

    if (!deleted) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
