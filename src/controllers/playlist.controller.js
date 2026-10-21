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

const addVideoToPlaylist = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.playlistId))
    {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if(!mongoose.isValidObjectId(req.params?.videoId))
    {
        throw new ApiError(400, "Invalid Video ID")
    }
    const playlist = await Playlist.findById(req.params?.playlistId)
    if(!playlist)
    {
        throw new ApiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== req.user?._id.toString())
    {
        throw new ApiError(403,"Access denied")
    }
    const video = await Video.findById(req.params?.videoId)
    if(!video)
    {
        throw new ApiError(404,"Video not found")
    }
    if (playlist.videos.some((existingVideoId) =>existingVideoId.equals(video._id))) 
        //playlist.videos - This is an array of ObjectIds representing videos already in the playlist.
        //.some((existingVideoId) => ...) some() checks each element in the array.
        //  Here, existingVideoId represents one ObjectId from that array.
        //existingVideoId.equals(video._id) 
        // - existingVideoId is the ID already stored in the playlist.
        // - video._id is the ID of the video you're trying to add.
        // - .equals() compares these two MongoDB ObjectIds correctly.
    {
        throw new ApiError(409, "Video already exists in playlist");
    }
    playlist.videos.push(video._id);
    await playlist.save();
    return res.status(200).json(new ApiResponse(200,playlist,"Video Added successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.playlistId))
    {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if(!mongoose.isValidObjectId(req.params?.videoId))
    {
        throw new ApiError(400, "Invalid Video ID")
    }
    const playlist = await Playlist.findById(req.params?.playlistId)
    if(!playlist)
    {
        throw new ApiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== req.user?._id.toString())
    {
        throw new ApiError(403,"Access denied")
    }
    const video = await Video.findById(req.params?.videoId)
    if(!video)
    {
        throw new ApiError(404,"Video not found")
    }
    if (!playlist.videos.some((existingVideoId) =>existingVideoId.equals(video._id)))
    {
        throw new ApiError(400,"Video doesn't exist in the playlist")
    }
    playlist.videos = playlist.videos.filter((existingVideoId) => !existingVideoId.equals(video._id));
    //.filter() creates a new array containing only the elements that pass the condition.
    await playlist.save()
    return res.status(200).json(new ApiResponse(200,playlist,"Video Removed successfully"))

});
const updatePlaylist = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.playlistId))
    {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const {playlistName, description} = req.body;
    if(playlistName !== undefined && !playlistName?.trim())
    {
        throw new ApiError(400,"Playlist Name is necessary")
    }
    
    const playlist = await Playlist.findById(req.params?.playlistId)
    if(!playlist)
    {
        throw new ApiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== req.user?._id.toString())
    {
        throw new ApiError(403,"Access denied")
    }
    if(playlistName !== undefined)
    {
        playlist.playlistName = playlistName?.trim();
    }
    
    if(description !== undefined)
    {
        playlist.description = description?.trim()
    }
    await playlist.save()
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
const { playlistId } = req.params;

if (!mongoose.isValidObjectId(playlistId)) 
{
    throw new ApiError(400, "Invalid playlist ID");
}

const playlist = await Playlist.findById(playlistId);

if (!playlist) 
{
    throw new ApiError(404, "Playlist not found");
}

if (playlist.owner.toString() !== req.user._id.toString()) 
{
    throw new ApiError(403, "Access denied");
}

await playlist.deleteOne();

return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));

});
export {createPlaylist,getMyPlaylists, getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,updatePlaylist,deletePlaylist}