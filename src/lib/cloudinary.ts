import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

/**
 * Uploads a base64 data URL (sent from the browser after the admin picks a
 * file) straight to Cloudinary. Used by product image and cohort image
 * uploads — nothing is ever written to local/server disk.
 */
export async function uploadImageToCloudinary(
  dataUrl: string,
  folder: "products" | "cohorts" | "avatars"
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `yarniebeauty/${folder}`,
    resource_type: "image",
  });

  return { secureUrl: result.secure_url, publicId: result.public_id };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
