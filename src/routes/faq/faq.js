import express from "express";
import {
  createFaq,
  createFaqWithSubSubCategoryId, // New function
  updateFaq,
  getAllFaqs,
  getFaqsByCategoryId,
  getFaqsBySubCategoryId,
  getFaqsBySubSubCategoryId,
  banFaq,
  deleteFaq,
} from "../../controllers/faq/faq.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/faqs", verify, createFaq);
router.post("/v1/faqs/subsubcategory", createFaqWithSubSubCategoryId); // New route
router.put("/v1/faqs/:id", verify, updateFaq);
router.get("/v1/faqs", verify, getAllFaqs);
router.get("/v1/faqs/category/:categoryId", verify, getFaqsByCategoryId);
router.get("/v1/faqs/subcategory/:subCategoryId", verify, getFaqsBySubCategoryId);
router.get("/v1/faqs/subsubcategory/:subSubCategoryId", getFaqsBySubSubCategoryId);
router.put("/v1/faqs/:id/ban", verify, banFaq);
router.delete("/v1/faqs/:id", verify, deleteFaq);

export default router;