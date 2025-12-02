import express from "express";
import {
  createColor,
  updateColor,
  getColors,
  getColorById,
  deleteColor,
} from "../../controllers/color/color.js";

const router = express.Router();

// Create Color
router.post("/v1/colors", createColor);

// Update Color
router.put("/v1/colors/:id", updateColor);

// Get all Colors
router.get("/v1/colors", getColors);

// Get Color by ID
router.get("/v1/colors/:id", getColorById);

// Delete Color
router.delete("/v1/colors/:id", deleteColor);

export default router;