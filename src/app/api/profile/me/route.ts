import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, profilesTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";
import { getOrCreateCurrentUserProfile } from "@/lib/server/profile";

export async function GET() {
  try {
    const profile = await getOrCreateCurrentUserProfile();
    return NextResponse.json(profile);
  } catch (err) {
    console.error("Failed to get or create profile", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateCurrentUserProfile();
    const rawData = await req.json();

    const cleanData: any = {};
    const allowedKeys = [
      "username", "displayName", "bio", "avatarUrl", "headerImageUrl",
      "phone", "email", "website", "smsNumber", "location",
      "contactSettings", "themeSettings", "leadCaptureEnabled", "verified"
    ];

    for (const key of allowedKeys) {
      if (rawData[key] !== undefined && rawData[key] !== null) {
        cleanData[key] = rawData[key];
      }
    }

    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await withRetry(() =>
      db
        .update(profilesTable)
        .set(cleanData)
        .where(eq(profilesTable.userId, userId))
        .returning()
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update profile", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
