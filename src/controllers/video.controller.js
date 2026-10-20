import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Like } from "../models/like.models.js";

const uploadVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body
    if(!title?.trim())
    {
        throw new ApiError(400,"Title does not exist")
    }
    if(!description?.trim())
    {
        throw new ApiError(400,"Description does not exist")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videoLocalPath)
    {
        throw new ApiError(400,"Video path does not exist")
    }
    if(!thumbnailLocalPath)
    {
        throw new ApiError(400,"Thumbnail does not exist")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!videoFile)
    {
        throw new ApiError(500, "Video upload failed")
    }
    if(!thumbnail)
    {
        throw new ApiError(500, "Thumbnail upload failed")
    }
    console.log(videoFile.secure_url);
console.log(videoFile.duration);
    const video = await Video.create({
        videoFile:videoFile.secure_url,
        thumbnail:thumbnail.secure_url,
        title:title,
        description:description,
        owner: req.user._id,
        duration:videoFile.duration
    });
    return res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully"))
});

const getAllVideos = asyncHandler(async (req,res)=>{
    const page = parseInt(req.query.page) || 1//we will parse it from the routes after the ? it is called query string
    const limit = parseInt(req.query.limit) || 10//http://localhost:8000/api/v1/videos?page=2&limit=10
       if (limit > 50) {
        throw new ApiError(400, "Limit cannot exceed 50");
    }
    if (!Number.isInteger(page) || page < 1) 
    {
        throw new ApiError(400, "Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1) 
    {
        throw new ApiError(400, "Limit must be a positive integer");
    }
    const skip = (page - 1)* limit //to retrieve how many video mongo db should skip
    const videos = await Video.find({isPublished:true})
                    .sort({createdAt:-1})
                    .skip(skip)
                    .limit(limit);
    const totalVideos = await Video.countDocuments({
        isPublished:true
    });
    const totalPages = Math.ceil(totalVideos/limit)
    const data = {
        page:page,
        limit:limit,
        totalVideos:totalVideos,
        totalPages:totalPages,
        videos:videos
    }
    return res.status(200).json(new ApiResponse(200,data,"Videos Retrieved successfully"))


});
    const getVideoById = asyncHandler(async (req,res)=>{
        if (!mongoose.isValidObjectId(req.params?.videoId))
        {
            throw new ApiError(400, "Invalid video ID");
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Such video don't exist")
        }
        return res.status(200).json(new ApiResponse(200,video,"Video fetched Successfully"))

    })

    const getMyVideos = asyncHandler(async (req,res)=>{
        const videos = await Video.find({
            owner: req.user?._id
        });
        return res.status(200).json(
        new ApiResponse(200, videos, "My videos fetched successfully")
        );
    });

    const updateVideoDetails = asyncHandler(async (req,res)=>{
        const {title,description} = req.body
        if (title === undefined && description === undefined) 
        {
            throw new ApiError(400, "Enter details to update");
        }

        if (!mongoose.isValidObjectId(req.params?.videoId)) 
        {
            throw new ApiError(400, "Invalid video ID");
        }

        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not Found")
        }
        if(video.owner.toString() !== req.user._id.toString())
        {
            throw new ApiError(403,"Access denied")
        }
        
        if (title !== undefined) 
        {
            video.title = title;
        }

        if (description !== undefined) 
        {
            video.description = description;
        }
        await video.save();
        return res.status(200).json(new ApiResponse(200,video,"Video updated successfully"))
    })
    const deleteVideo = asyncHandler(async (req,res)=>{
        if (!mongoose.isValidObjectId(req.params?.videoId)) 
        {
            throw new ApiError(400, "Invalid video ID");
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not found")
        }
        if(video.owner.toString() !== req.user._id.toString())
        {
            throw new ApiError(403,"Access Denied")
        }
        await video.deleteOne() //This deletes the video document from MongoDB.
        return res.status(200).json(new ApiResponse(200,null,"Video deleted Successfully"))

    });
    const togglePublishStatus = asyncHandler(async (req,res)=>{
        if (!mongoose.isValidObjectId(req.params?.videoId)) 
        {
            throw new ApiError(400, "Invalid video ID");
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not found")
        }
        if(video.owner.toString() !== req.user._id.toString())
        {
            throw new ApiError(403,"Access Denied")
        }
        video.isPublished = !video.isPublished
        await video.save()
        return res.status(200).json(new ApiResponse(200,video,video.isPublished
            ? "Video published successfully"
            : "Video unpublished successfully"
        ))
    });

    const likeVideo = asyncHandler(async (req,res)=>{
        if(!mongoose.isValidObjectId(req.params?.videoId))
        {
            throw new ApiError(400, "Invalid video ID")
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not Found")
        }
        const checkLike = await Like.findOne({ video: req.params?.videoId, likedBy: req.user._id })
        if(checkLike)
        {
            throw new ApiError(409, "Video already liked");
        }
        const like = await Like.create({
            video:video._id,
            likedBy:req.user?._id
        })
        return res.status(201).json(new ApiResponse(201,like,"The video liked successfully"))
    })
    
    const unlikeVideo = asyncHandler(async (req,res)=>{
        if(!mongoose.isValidObjectId(req.params?.videoId))
        {
            throw new ApiError(400, "Invalid video ID")
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not Found")
        }
        const like = await Like.findOne({video: req.params?.videoId, likedBy: req.user._id})
        if(!like)
        {
            throw new ApiError(404,"Like does not exist")
        }
        await like.deleteOne()
        return res.status(200).json(new ApiResponse(200,null,"The video unliked successfully"))
    });
    const getVideoLikes = asyncHandler(async (req,res)=>{
        if(!mongoose.isValidObjectId(req.params?.videoId))
        {
            throw new ApiError(400, "Invalid video ID")
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not Found")
        }
        const likesCount = await Like.countDocuments({
            video: video._id
        })
        return res.status(200).json(new ApiResponse(200,likesCount,"Like count fetched successfully"))
    })

    const isVideoLikedByUser = asyncHandler(async (req,res)=>{
        if(!mongoose.isValidObjectId(req.params?.videoId))
        {
            throw new ApiError(400, "Invalid video ID")
        }
        const video = await Video.findById(req.params?.videoId)
        if(!video)
        {
            throw new ApiError(404,"Video not Found")
        }
        const liked = await Like.findOne({video:video?._id , likedBy:req.user?._id})
        return res.status(200).json(new ApiResponse(200,{ isLiked: Boolean(liked) },
        "Video like status fetched successfully"
    ));
        
    })
export {uploadVideo, getAllVideos, getVideoById,getMyVideos,updateVideoDetails,deleteVideo,togglePublishStatus, likeVideo, unlikeVideo,getVideoLikes,isVideoLikedByUser}