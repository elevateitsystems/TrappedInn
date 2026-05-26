import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profilesTable } from "@/db/schema/profiles";
import { profileModesTable } from "@/db/schema/profile-modes";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    });

    if (!profile) {
      return NextResponse.json([]);
    }

    const modes = await db.query.profileModesTable.findMany({
      where: eq(profileModesTable.profileId, profile.id),
      orderBy: [asc(profileModesTable.position)],
    });

    return NextResponse.json(modes);
  } catch (error) {
    console.error("Failed to fetch modes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
