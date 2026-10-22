import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.channelId))
    {
        throw new ApiError(400,"Invalid channel id")
    }
    const channel = await User.findById(req.params.channelId);

    if (!channel)
    {
        throw new ApiError(404, "Channel doesn't exist");
    }
    const totalSubscriptions = await Subscription.countDocuments({ channel: req.params?.channelId });
    const totalVideos = await Video.countDocuments({owner:req.params?.channelId})
    const result = await Video.aggregate([
        {
            $match: {
                owner:new mongoose.Types.ObjectId(req.params?.channelId)
            }
        },
        {
            $group:{
                _id:null, //put all matched videos into one group.
                totalViews: {$sum:"$views"} //add the views from every video in that group.
            }
        }
    ])
    const totalViews = result[0]?.totalViews || 0

    const result1 = await Video.aggregate([
        {
            $match: {
                owner:new mongoose.Types.ObjectId(req.params?.channelId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"videoLikes"
            }
        },
        {
            $unwind:"$videoLikes"
        },
        {
            $count:"totalLikes"
        }
    ])
    const totalLikes = result1[0]?.totalLikes || 0;
    return res.status(200).json(new ApiResponse(200,
        {
            totalSubscriptions,
            totalVideos,
            totalViews,
            totalLikes
        },
        "Channel statistics fetched successfully"
    ))
})
export {getChannelStats}