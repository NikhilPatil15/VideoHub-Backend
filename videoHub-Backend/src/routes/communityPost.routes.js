import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
    deleteCommunityPost,
    getAllPosts,
    getSingleCommunityPost,
    updateCommunityPost,
    uploadCommunityPost,
} from "../controllers/communityPost.controller";

const router = Router();

router
    .route("/uploadCommunityPost")
    .post(verifyJWT, upload.single("image"), uploadCommunityPost);

router.route("/d/:id").post(verifyJWT, deleteCommunityPost);

router.route("/allCommunityPosts").get(verifyJWT, getAllPosts);

router
    .route("/u/:id")
    .post(verifyJWT, upload.single("image"), updateCommunityPost);

router.route("/community-post/:id").get(verifyJWT, getSingleCommunityPost);

export default router;
