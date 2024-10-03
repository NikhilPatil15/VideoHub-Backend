import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, toggleCommunityPostLike, toggleVideoLike } from "../controllers/like.controller";
const router = Router();

router.route("/v/:videoId").post(verifyJWT,toggleVideoLike);

router.route("/c/:commentId").post(verifyJWT,toggleCommentLike)

router.route("/cp/:communityPostId").post(verifyJWT,toggleCommunityPostLike)

export default router
