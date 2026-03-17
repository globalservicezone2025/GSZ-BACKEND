import { v2 as cloudinary } from "cloudinary";
import { extname } from "path";
import sharp from "sharp";
import { Readable } from "stream";

const uploadToCloudinary = async (files, folder) => {
  try {
    // Normalize single file / multiple files
    let normalizedFiles = [];

    if (!files) return [];

    if (Array.isArray(files)) {
      normalizedFiles = files;
    } else {
      normalizedFiles = [files];
    }

    if (normalizedFiles.length === 0) return [];

    if (normalizedFiles.length > 8) {
      console.log("You cannot upload more than 8 pictures");
      return false;
    }

    const uploadedUrls = [];

    const bufferToStream = (buffer) => {
      const readable = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      return readable;
    };

    for (const file of normalizedFiles) {
      if (!file?.originalname || !file?.buffer) {
        console.log("Invalid file object");
        return false;
      }

      const fileExtension = extname(file.originalname).toLowerCase();

      if (![".jpg", ".jpeg", ".png", ".webp"].includes(fileExtension)) {
        console.log("Please select jpg/jpeg/png/webp image");
        return false;
      }

      // Convert to webp
      const data = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to cloudinary
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            return resolve(result.secure_url);
          }
        );

        bufferToStream(data).pipe(stream);
      });

      uploadedUrls.push(url);
    }

    return uploadedUrls; // Always returns array
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);
    return false;
  }
};

export default uploadToCloudinary;