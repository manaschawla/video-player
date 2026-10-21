import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, getMyPlaylists, getUserPlaylists,getPlaylistById , addVideoToPlaylist,removeVideoFromPlaylist,updatePlaylist,deletePlaylist} from "../controllers/playlist.controller.js";

const router = Router()

router.route("/").post(verifyJWT, createPlaylist);
router.route("/my-playlists").get(verifyJWT,getMyPlaylists)
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)
                            .patch(verifyJWT, updatePlaylist)
                            .delete(verifyJWT, deletePlaylist);
router.route("/:playlistId/videos/:videoId").post(verifyJWT, addVideoToPlaylist)
                                            .delete(verifyJWT, removeVideoFromPlaylist);
export default router;

