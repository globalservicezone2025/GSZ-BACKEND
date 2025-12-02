import express from "express";
import {
  createEProduct,
  updateEProduct,
  deleteEProduct,
  reStockEProduct,
  getEProduct,
  getEProducts,
} from "../../controllers/eProduct/eProduct.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/eproducts",
  verify,
  upload.array("images", 8), // <-- allow 8 images
  createEProduct
);

// Update EProduct — allow up to 8 images
router.put(
  "/v1/eproducts/:id",
  verify,
  upload.array("images", 8), // <-- allow 8 images
  updateEProduct
);

// Get all EProducts with filters and sorting
router.get("/v1/eproducts", getEProducts);

// Get single EProduct by ID
router.get("/v1/eproducts/:id", getEProduct);



// Delete (deactivate) EProduct
router.delete(
  "/v1/eproducts/:id",
  verify,
  deleteEProduct
);

// Re-stock (activate) EProduct
router.patch(
  "/v1/eproducts/:id/restock",
  verify,
  reStockEProduct
);

export default router;