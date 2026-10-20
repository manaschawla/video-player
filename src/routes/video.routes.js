import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, getMyVideos, getVideoById, updateVideoDetails, uploadVideo,deleteVideo, togglePublishStatus, likeVideo } from "../controllers/video.controller.js";

const router = Router();
//specific routes first
router.route("/my-videos").get(verifyJWT,getMyVideos)
router.post("/upload",verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
);
router.route("/").get(getAllVideos)

//Dynamic Routes
router.route("/:videoId").get(getVideoById);
router.route("/update/:videoId").patch(verifyJWT,updateVideoDetails)
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/like/:videoId").post(verifyJWT, likeVideo);
export default router;