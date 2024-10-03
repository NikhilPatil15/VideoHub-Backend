import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { deleteCommunityPost, getAllPosts, uploadCommunityPost } from "../controllers/communityPost.controller";

const router = Router()

router.route("/uploadCommunityPost").post(verifyJWT, upload.single("image"), uploadCommunityPost)

router.route("/d/:id").post(verifyJWT, deleteCommunityPost)

router.route("/allCommunityPosts").get(verifyJWT, getAllPosts)

export default router