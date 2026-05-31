import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, linksTable, withRetry } from "@/db";
import { ApiError, getOrCreateCurrentUserProfile } from "@/lib/server/profile";

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Links API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  new URL(withProtocol);
  return withProtocol;
}

export async function GET() {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const links = await withRetry(() =>
      db.query.linksTable.findMany({
        where: eq(linksTable.profileId, profile.id),
        orderBy: [asc(linksTable.position)],
      })
    );

    return NextResponse.json(links);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const rawUrl = String(body.url ?? "").trim();

    if (!title || !rawUrl) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    let url: string;
    try {
      url = normalizeUrl(rawUrl);
    } catch {
      return NextResponse.json({ error: "Enter a valid URL" }, { status: 400 });
    }

    const currentLinks = await withRetry(() =>
      db.query.linksTable.findMany({
        where: eq(linksTable.profileId, profile.id),
      })
    );
    const nextPosition =
      currentLinks.reduce((max, link) => Math.max(max, link.position), -1) + 1;

    const [created] = await withRetry(() =>
      db
        .insert(linksTable)
        .values({
          id: crypto.randomUUID(),
          profileId: profile.id,
          title,
          url,
          position: nextPosition,
        })
        .returning()
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
