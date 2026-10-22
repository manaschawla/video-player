import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { subscribeToChannel ,unsubscribeFromChannel,getUserChannelSubscribers,getSubscribedChannels} from "../controllers/subscription.controller.js";

const router = Router();
router.route("/c").get(verifyJWT, getSubscribedChannels); //channels you have subscribed
router.route("/c/:channelId").post(verifyJWT,subscribeToChannel)
                            .delete(verifyJWT, unsubscribeFromChannel);
router.route("/c/:channelId/subscribers").get(getUserChannelSubscribers); // subscribers of the channel
export default router;