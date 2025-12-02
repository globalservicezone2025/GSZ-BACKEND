import express from "express";
import multer from "multer";
import { createBlog, updateBlog, deleteBlog, getAllBlogs, getBlogById } from "../../controllers/blog/blog.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/v1/blogs", verify, upload.single("image"), createBlog);
router.put("/v1/blogs/:id", verify, upload.single("image"), updateBlog);
router.delete("/v1/blogs/:id", verify, deleteBlog);
router.get("/v1/blogs", getAllBlogs);
router.get("/v1/blogs/:id", getBlogById);

export default router;