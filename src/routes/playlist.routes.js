import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, getMyPlaylists, getUserPlaylists,getPlaylistById } from "../controllers/playlist.controller.js";

const router = Router()

router.route("/").post(verifyJWT, createPlaylist);
router.route("/my-playlists").get(verifyJWT,getMyPlaylists)
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById);
export default router;
