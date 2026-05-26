import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db, profilesTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await withRetry(() => db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    }));

    if (!profile) {
      // Auto-create profile if missing
      const user = await currentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const email = user.emailAddresses[0]?.emailAddress || "";
      const name = user.firstName || user.username || "New User";
      
      const newProfile = {
        userId,
        username: (user.username || user.id).toLowerCase(),
        displayName: name,
        email,
        bio: "",
        themeSettings: {},
        contactSettings: {},
        leadCaptureEnabled: false,
        verified: false,
      };

      const [inserted] = await db.insert(profilesTable).values(newProfile).returning();
      profile = inserted;
    }

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

    const [updated] = await db
      .update(profilesTable)
      .set(cleanData)
      .where(eq(profilesTable.userId, userId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update profile", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
