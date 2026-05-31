import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/profile";
import { saveUploadedImage } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireUserId();
    const formData = await req.formData();
    const file = formData.get("header");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Header image is required" }, { status: 400 });
    }

    const headerImageUrl = await saveUploadedImage(file, "headers");
    return NextResponse.json({ header_image_url: headerImageUrl, headerImageUrl });
  } catch (error) {
    console.error("Header upload failed", error);
    return NextResponse.json({ error: "Failed to upload header image" }, { status: 500 });
  }
}
