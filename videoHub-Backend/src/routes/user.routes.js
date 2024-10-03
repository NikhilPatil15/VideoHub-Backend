import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getUserWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
 
/* Register route */
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

/* Login route */
router.route("/login").post(loginUser);

/* Secured Routes */
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-AccessToken").post(refreshAccessToken);
router
    .route("/updateAvatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
    .route("/updateCoverImage")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router.route("/currentUser").get(verifyJWT, getCurrentUser);
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/WatchHistory").get(verifyJWT, getUserWatchHistory);

export default router;
