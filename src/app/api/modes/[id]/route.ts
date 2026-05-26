import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, profileModesTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const [deleted] = await withRetry(() =>
      db
        .delete(profileModesTable)
        .where(eq(profileModesTable.id, id))
        .returning()
    );
    if (!deleted) {
      return NextResponse.json({ error: "Mode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete mode", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
