import { v2 as cloudinary } from "cloudinary";
import { extname } from "path";
import sharp from "sharp";
import { Readable } from "stream";

const uploadToCloudinary = async (files, folder) => {
  try {
    if (!files) return [];

    // ✅ Single file হলে array-এ convert করো
    if (!Array.isArray(files)) {
      files = [files];
    }

    if (files.length === 0) return [];

    if (files.length > 8) {
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

    for (let file of files) {
      const file_extension = extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(file_extension)) {
        console.log("Please select jpg/jpeg/png/webp image");
        return false;
      }

      // Convert image to WebP with sharp
      const data = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();

      // Upload to Cloudinary
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        bufferToStream(data).pipe(stream);
      });

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);
    return false;
  }
};

export default uploadToCloudinary;