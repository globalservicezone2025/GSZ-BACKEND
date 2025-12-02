import express from "express";
import {
  createECategory,
  getECategories,
  getECategory,
  updateECategory,
  deleteECategory,
} from "../../controllers/eCategory/eCategory.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";
import {
  categoryCreate,
  categoryEdit,
  categoryList,
  categoryRemove,
  categorySingle,
} from "../../utils/modules.js";

// const upload = multer({ dest: "public/images/category" });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/ecategories",
  categoryCreate,
  verify,
  upload.single("image"),
  createECategory
);
router.get("/v1/ecategories", categoryList, getECategories);
router.get("/v1/ecategories/:id", categorySingle, getECategory);
router.put(
  "/v1/ecategories/:id",
  categoryEdit,
  verify,
  upload.single("image"),
  updateECategory
);
router.delete("/v1/ecategories/:id", categoryRemove, verify, deleteECategory);

export default router;