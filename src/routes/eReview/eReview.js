import express from "express";
import {
  createEReview,
  updateEReview,
  getEReviews,
  getEReviewById,
  deleteEReview,
  getEReviewsByProductId, // added import
} from "../../controllers/eReview/eReview.js";

const router = express.Router();

// Create EReview
router.post("/v1/ereviews", createEReview);

// Update EReview
router.put("/v1/ereviews/:id", updateEReview);

// Get all EReviews
router.get("/v1/ereviews", getEReviews);

// Get EReview by ID
router.get("/v1/ereviews/:id", getEReviewById);

// Delete EReview
router.delete("/v1/ereviews/:id", deleteEReview);

// Get reviews for a particular product
router.get("/v1/ereviews/product/:productId", getEReviewsByProductId);

// Sample response for GET /v1/ereviews/product/:productId
/*
{
  "success": true,
  "message": "Reviews found",
  "data": [
    {
      "id": "clwxyz1234567890",
      "name": "John Doe",
      "rating": 5,
      "review": "Great product!",
      "productId": "clwprod987654321",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "createdAt": "2024-06-10T12:34:56.789Z",
      "updatedAt": "2024-06-10T12:34:56.789Z"
    },
    {
      "id": "clwxyz0987654321",
      "name": "Jane Smith",
      "rating": 4,
      "review": "Good value for money.",
      "productId": "clwprod987654321",
      "email": "jane@example.com",
      "phoneNumber": "0987654321",
      "createdAt": "2024-06-09T10:20:30.456Z",
      "updatedAt": "2024-06-09T10:20:30.456Z"
    }
    // ...more reviews
  ]
}
*/

export default router;