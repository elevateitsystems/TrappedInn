// import { mkdir, writeFile } from "fs/promises";
// import path from "path";

// const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
// const ALLOWED_TYPES = new Map([
//   ["image/jpeg", "jpg"],
//   ["image/png", "png"],
//   ["image/webp", "webp"],
//   ["image/gif", "gif"],
// ]);

// export async function saveUploadedImage(file: File, folder: "avatars" | "headers") {
//   const extension = ALLOWED_TYPES.get(file.type);

//   if (!extension) {
//     throw new Error("Unsupported image type");
//   }

//   if (file.size > MAX_IMAGE_BYTES) {
//     throw new Error("Image is too large");
//   }

//   const bytes = Buffer.from(await file.arrayBuffer());
//   const filename = `${crypto.randomUUID()}.${extension}`;
//   const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
//   const uploadPath = path.join(uploadDir, filename);

//   await mkdir(uploadDir, { recursive: true });
//   await writeFile(uploadPath, bytes);

//   return `/uploads/${folder}/${filename}`;
// }


import cloudinary from "./cloudinary";

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result?.secure_url || "");
        }
      )
      .end(buffer);
  });
}