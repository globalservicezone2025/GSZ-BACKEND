import express from "express";
import {
  createCareer,
  updateCareer,
  searchAllCareers,
  searchCareerById,
  deleteCareer,
} from "../../controllers/career/career.js";

const router = express.Router();

// Create career
router.post("/v1/careers", createCareer);

// Update career
router.put("/v1/careers/:id", updateCareer);

// Search all careers (limited fields, only visible and not deleted)
router.get("/v1/careers", searchAllCareers);

// Search career by ID (all info)
router.get("/v1/careers/:id", searchCareerById);

// Delete career (soft delete)
router.delete("/v1/careers/:id", deleteCareer);

export default router;
