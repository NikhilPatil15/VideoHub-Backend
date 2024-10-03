import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addView,
    deleteVideo,
    getAllVideos,
    getSingleVideo,
    trendingVideos,
    updateVideoDetails,
    uploadVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/uploadVideo").post(
    verifyJWT,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideo
);

router.route("/d/:id").post(verifyJWT, deleteVideo);

router.route("/u/:id").patch(verifyJWT,upload.single("thumbnail"),updateVideoDetails);

router.route("/getAllVideos").get(getAllVideos);

router.route("/v/:id").get(verifyJWT, getSingleVideo).patch(verifyJWT, addView);

router.route("/trendings").get(trendingVideos);

export default router;
