import authRoutes from "./auth/index.js";
import bannerRoutes from "./banner/index.js";
import blogRoutes from "./blog/index.js";
import brandRoutes from "./brand/index.js";
import campaignRoutes from "./campaign/index.js";
import categoryRoutes from "./category/index.js";
import eCategoryRoutes from "./eCategory/index.js";
import contactRoutes from "./contact/index.js";
import couponRoutes from "./coupon/index.js";
import dashboardRoutes from "./dashboard/index.js";
import faqRoutes from "./faq/index.js";
import newsletterRoutes from "./newsletter/index.js";
import orderRoutes from "./order/index.js";
import monthlyPaymentRoutes from "./payment/index.js";
import preorderRoutes from "./preorder/index.js";
import pricingRoutes from "./pricing/index.js";
import productRoutes from "./product/index.js";
import reviewRoutes from "./review/index.js";
import sliderRoutes from "./slider/index.js";
import subcategoryRoutes from "./subcategory/index.js";
import subsubcategoryRoutes from "./subsubcategory/index.js";
import supplierRoutes from "./supplier/index.js";
import eProductRoutes from "./eProduct/index.js";
import cartRoutes from "./cart/index.js";
import eOrderRoutes from "./eOrder/index.js";
import discountRoutes from "./discount/index.js";
import colorRoutes from "./color/index.js";
import eReviewRoutes from "./eReview/index.js";
import careerRoutes from "./career/index.js";

const allRoutes = [
  ...authRoutes,
  ...monthlyPaymentRoutes,
  ...categoryRoutes,
  ...cartRoutes,
  ...colorRoutes,
  ...eCategoryRoutes,
  ...eProductRoutes,
  ...eOrderRoutes,
  ...eReviewRoutes,
  ...campaignRoutes,
  ...discountRoutes,
  ...supplierRoutes,
  ...productRoutes,
  ...orderRoutes,
  ...dashboardRoutes,
  ...bannerRoutes,
  ...brandRoutes,
  ...sliderRoutes,
  ...subcategoryRoutes,
  ...subsubcategoryRoutes,
  ...couponRoutes,
  ...preorderRoutes,
  ...reviewRoutes,
  ...newsletterRoutes,
  ...contactRoutes,
  ...pricingRoutes,
  ...faqRoutes,
  ...blogRoutes,
    ...careerRoutes,
];

export default allRoutes;
