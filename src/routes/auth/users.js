import express from "express";
import multer from "multer";
import {
  banUser,
  deleteUser,
  getUser,
  getUsers,
  getUsersByUser,
  updateUser,
} from "../../controllers/auth/user.js";
import {
  usersBan,
  usersList,
  usersRemove,
  usersSingle,
  usersUserList,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/v1/auth/users", usersList, getUsers);
router.get("/v1/auth/user/users", usersUserList, verify, getUsersByUser);
router.get("/v1/auth/users/:id", usersSingle, verify, getUser);
router.put("/v1/auth/users/:id", verify, upload.single("image"), updateUser);
router.put("/v1/users/:id/ban", usersBan, verify, banUser);
router.delete("/v1/auth/users/:id", usersRemove, verify, deleteUser);

//For customer
router.get("/v1/customer/auth/users/:id", verify, getUser);
router.put("/v1/customer/auth/users/:id", verify, updateUser);

export default router;
