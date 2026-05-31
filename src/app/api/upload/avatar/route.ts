import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/profile";
import { saveUploadedImage } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireUserId();
    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Avatar image is required" }, { status: 400 });
    }

    const avatarUrl = await saveUploadedImage(file, "avatars");
    return NextResponse.json({ avatar_url: avatarUrl, avatarUrl });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
