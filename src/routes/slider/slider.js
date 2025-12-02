import express from "express";
import multer from "multer";
import {
  createSlider,
  deleteSlider,
  getSlider,
  getSliderForCustomer,
  getSliders,
  getSlidersForCustomer,
  updateSlider,
} from "../../controllers/slider/slider.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/v1/sliders", verify, upload.single("image"), createSlider);
router.get("/v1/sliders", verify, getSliders);
router.get("/v1/sliders/:id", verify, getSlider);
router.put("/v1/sliders/:id", verify, upload.single("image"), updateSlider);
router.delete("/v1/sliders/:id", verify, deleteSlider);

// For customer
router.get("/v1/customer/sliders", getSlidersForCustomer);
router.get("/v1/customer/sliders/:id", getSliderForCustomer);

export default router;