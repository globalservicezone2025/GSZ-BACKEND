import express from "express";
import {
  createSubsubcategory,
  getSubsubcategories,
  getSubsubcategoriesBySubcategory,
  getSubsubcategory,
  updateSubsubcategory,
  deleteSubsubcategory,
  getSubsubcategoriesForCustomer,
  getSubsubcategoryForCustomer,
  countActiveSubsubcategories, // Import the new function
} from "../../controllers/subsubcategory/subsubcategory.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/subsubcategories",
  verify,
  upload.single("image"),
  createSubsubcategory
);
router.get("/v1/subsubcategories", getSubsubcategories);
router.get("/v1/subsubcategories/subcategory/:id", getSubsubcategoriesBySubcategory);
router.get("/v1/subsubcategories/:id", getSubsubcategory);
router.put(
  "/v1/subsubcategories/:id",
  verify,
  upload.single("image"),
  updateSubsubcategory
);
router.delete("/v1/subsubcategories/:id", verify, deleteSubsubcategory);

// For customer
router.get("/v1/customer/subsubcategories", getSubsubcategoriesForCustomer);
router.get("/v1/customer/subsubcategories/:id", getSubsubcategoryForCustomer);

// New route for counting active subsubcategories
router.get("/v1/subsubcategories/count/active", countActiveSubsubcategories);

export default router;