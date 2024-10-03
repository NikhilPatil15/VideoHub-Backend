import { Router } from "express";
import { toggleDislikeComment, toggleDislikeCommunityPost, toggleDislikeVideo } from "../controllers/dislike.controller";
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/v/:videoId').post(verifyJWT,toggleDislikeVideo)

router.route('/c/:commentId').post(verifyJWT,toggleDislikeComment)

router.route('/cp/:communityPostId').post(verifyJWT, toggleDislikeCommunityPost)

export default router