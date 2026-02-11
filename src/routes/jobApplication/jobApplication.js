import express from "express";
import multer from "multer";
import {
  createJobApplication,
  updateJobApplication,
  searchAllJobApplications,
  searchJobApplicationById,
  deleteJobApplication,
} from "../../controllers/jobApplication/jobApplication.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });
// Submit job application (accept single file upload under field `file`)
router.post("/v1/jobapplications", upload.single("file"), createJobApplication);

// Update application
router.put("/v1/jobapplications/:id", updateJobApplication);

// List applications
router.get("/v1/jobapplications", searchAllJobApplications);

// Get application by ID
router.get("/v1/jobapplications/:id", searchJobApplicationById);

// Soft delete application
router.delete("/v1/jobapplications/:id", deleteJobApplication);

export default router;