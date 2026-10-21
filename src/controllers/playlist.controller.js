import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req,res)=>{
    const {playlistName,description} = req.body;
    if(!playlistName?.trim())
    {
        throw new ApiError(400,"Playlist Name is necessary")
    }
    const playlist = await Playlist.create({
        playlistName:playlistName?.trim(),
        description:description,
        owner:req.user?._id
    })
    return res.status(201).json(new ApiResponse(201,playlist,"Playlist created successfully"))
})

const getVideoInPlaylist = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.playlistId))
    {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(req.params?.playlistId)
    if(!playlist)
    {
        throw new ApiError(404,"Playlist doesn't exist")
    }

})

const getMyPlaylists = asyncHandler(async (req,res)=>{
    const playlists = await Playlist.find({owner:req.user?._id});
    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
        );
})

const getUserPlaylists = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.userId))
    {
        throw new ApiError(400, "Invalid User ID")
    }
    const playlists = await Playlist.find({owner:req.params?.userId});
    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
        );
})

const getPlaylistById = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.playlistId))
    {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(req.params?.playlistId).populate("videos")
    if(!playlist)
    {
        throw new ApiError(404,"Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
})

export {createPlaylist,getMyPlaylists, getUserPlaylists,getPlaylistById}