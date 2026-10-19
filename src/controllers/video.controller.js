import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

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

export {uploadVideo, getAllVideos}