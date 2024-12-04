import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserDetails,
  updateUserPassword,
  updateUserAvatar,
} from "../contoller/user.controller.js";
import { verifyJwtForUser } from "../middleware/userAuth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();


router.route("/register").post(

  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwtForUser,logoutUser);
router.route("/update").patch(verifyJwtForUser,updateUserDetails);
router.route("/change-password").patch(verifyJwtForUser,updateUserPassword);
router.route("/update-avatar").patch(verifyJwtForUser,updateUserAvatar);

export default router;
