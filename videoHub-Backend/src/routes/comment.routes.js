import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { addCommunityPostComment, addVideoComment, deleteCommunityPostComment, deleteVideoComment, updateCommunityPostComment, updateVideoComment } from "../controllers/comment.controller";


const router = Router()

router.route('/v/:videoId').post(verifyJWT,addVideoComment)


router.route('/v/update/:commentId/:videoId').post(verifyJWT, updateVideoComment)

router.route('/v/:commentId/:videoId').delete(verifyJWT, deleteVideoComment)

router.route('/cp/:communityPostId').post(verifyJWT, addCommunityPostComment)

router.route('/cp/update/:commentId/:commnityPostId').post(verifyJWT, updateCommunityPostComment)

router.route('/cp/:commentId/:communityPostId').delete(verifyJWT, deleteCommunityPostComment)

export default router