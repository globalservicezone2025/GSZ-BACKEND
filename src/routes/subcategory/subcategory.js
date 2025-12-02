import express from "express";
import {
  createSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesForCustomer,
  getSubcategoryForCustomer,
  countActiveSubcategories, // Import the new function
} from "../../controllers/subcategory/subcategory.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/subcategories",
  verify,
  upload.single("image"),
  createSubcategory
);
router.get("/v1/subcategories", getSubcategories);
router.get("/v1/subcategories/category/:id", getSubcategoriesByCategory);
router.get("/v1/subcategories/:id", getSubcategory);
router.put(
  "/v1/subcategories/:id",
  verify,
  upload.single("image"),
  updateSubcategory
);
router.delete("/v1/subcategories/:id", verify, deleteSubcategory);

// For customer
router.get("/v1/customer/subcategories", getSubcategoriesForCustomer);
router.get("/v1/customer/subcategories/:id", getSubcategoryForCustomer);

// New route for counting active subcategories
router.get("/v1/subcategories/count/active", countActiveSubcategories);

export default router;