import express from "express";
import {
  createDiscount,
  updateDiscount,
  getDiscounts,
  getDiscountById,
  deleteDiscount,
} from "../../controllers/discount/discount.js";

const router = express.Router();

// Create Discount
router.post("/v1/discounts", createDiscount);

// Update Discount
router.put("/v1/discounts/:id", updateDiscount);

// Get all Discounts
router.get("/v1/discounts", getDiscounts);

// Get Discount by ID
router.get("/v1/discounts/:id", getDiscountById);

// Delete Discount
router.delete("/v1/discounts/:id", deleteDiscount);

export default router;