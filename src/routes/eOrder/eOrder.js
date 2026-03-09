import express from "express";
import {
  createEOrder,
  updateEOrder,
  getEOrders,
  getEOrderById,
  initiateSslCommerzPayment,
  updateEOrderStatus,
  getEOrderByIdOrEmailOrPhone,
} from "../../controllers/eOrder/eOrder.js";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Create EOrder
router.post("/v1/eorders", upload.array("files", 3), createEOrder);

// Update EOrder
router.put("/v1/eorders/:id", updateEOrder);

// Update EOrder status by ID and status
router.put("/v1/eorders/:id/status/:status", updateEOrderStatus);

// Show all EOrders
router.get("/v1/eorders", getEOrders);

// Get EOrder by ID, Email, or Phone Number
router.get("/v1/eorders/search", getEOrderByIdOrEmailOrPhone);

// Get EOrder by ID
router.get("/v1/eorders/:id", getEOrderById);

// Initiate SSLCommerz Payment
router.post("/v1/eorders/payment/initiate", initiateSslCommerzPayment);

export default router;
