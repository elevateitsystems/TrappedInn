import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db, linksTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Link reorder API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function PUT(req: Request) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const body = await req.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    const ownedLinks = await withRetry(() =>
      db.query.linksTable.findMany({
        where: and(eq(linksTable.profileId, profile.id), inArray(linksTable.id, ids)),
      })
    );

    if (ownedLinks.length !== ids.length) {
      return NextResponse.json({ error: "One or more links were not found" }, { status: 404 });
    }

    await Promise.all(
      ids.map((id, position) =>
        withRetry(() =>
          db
            .update(linksTable)
            .set({ position })
            .where(and(eq(linksTable.id, id), eq(linksTable.profileId, profile.id)))
        )
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
