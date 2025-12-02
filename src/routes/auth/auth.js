import express from "express";
import multer from "multer";
import { register, login, sendLoginOtp, loginWithOtp, logout } from "../../controllers/auth/auth.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/register", upload.single("image"), register);
router.post("/v1/auth/login", login);
router.post("/v1/auth/send-login-otp", sendLoginOtp);
router.post("/v1/auth/login-with-otp", loginWithOtp);
router.post("/v1/auth/logout", verify, logout);

export default router;