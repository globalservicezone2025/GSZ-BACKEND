import express from "express";
import {
  createPricing,
  updatePricing,
  getAllPricings,
  getPricingsByCategoryId,
  getPricingsBySubCategoryId,
  getPricingsBySubSubCategoryId,
  banPricing,
  deletePricing,
} from "../../controllers/pricing/pricing.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/pricings", verify, createPricing);
router.put("/v1/pricings/:id", verify, updatePricing);
router.get("/v1/pricings", verify, getAllPricings);
router.get("/v1/pricings/category/:categoryId", verify, getPricingsByCategoryId);
router.get("/v1/pricings/subcategory/:subCategoryId", verify, getPricingsBySubCategoryId);
router.get("/v1/pricings/subsubcategory/:subSubCategoryId", getPricingsBySubSubCategoryId);
router.put("/v1/pricings/:id/ban", verify, banPricing);
router.delete("/v1/pricings/:id", verify, deletePricing);

export default router;
