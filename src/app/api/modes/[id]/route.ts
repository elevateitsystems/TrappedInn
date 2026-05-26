import { NextResponse } from "next/server";
import { db, modesTable, withRetry } from "@/db";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await withRetry(() =>
      db
        .delete(modesTable)
        .where(eq(modesTable.id, id))
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
