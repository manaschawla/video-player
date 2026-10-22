import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Subscription } from "../models/subscriptions.models.js";
import { User } from "../models/user.model.js";
const subscribeToChannel = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.channelId))
    {
        throw new ApiError(400,"Channel doesn't exist")
    }
    if (req.user?._id.toString() === req.params?.channelId) 
    {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
    const channel = await User.findById(req.params?.channelId)
    if(!channel)
    {
        throw new ApiError(404,"Channel doesn't exist")
    }
    const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: req.params.channelId
    });

    if (existingSubscription) 
    {
        throw new ApiError(409, "Already subscribed to this channel");
    }
    const subscribe = await Subscription.create({
        subscriber:req.user?._id,
        channel:req.params?.channelId
    })
    return res.status(201).json(new ApiResponse(201,subscribe,"The channel is subscribed successfully"))
})

const unsubscribeFromChannel = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.channelId))
    {
        throw new ApiError(400,"Channel doesn't exist")
    }
    const channel = await User.findById(req.params?.channelId)
    if(!channel)
    {
        throw new ApiError(404,"Channel doesn't exist")
    }
    const existingSubscription = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:req.params?.channelId
    })
    if(!existingSubscription)
    {
        throw new ApiError(404,"The channel is not subscribed")
    }
    await existingSubscription.deleteOne()
    return res.status(200).json(new ApiResponse(200,null,"The channel is unsubscribed successfully"))
})
const getUserChannelSubscribers = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params?.channelId))
    {
        throw new ApiError(400,"Channel doesn't exist")
    }
    const channel = await User.findById(req.params?.channelId)
    if(!channel)
    {
        throw new ApiError(404,"Channel doesn't exist")
    }
    const subscriptions = await Subscription.find({channel:req.params?.channelId}).populate("subscriber","username fullName avatar")
    const totalSubscriptions = subscriptions.length
    return res.status(200).json(new ApiResponse(200,{ totalSubscriptions, subscribers: subscriptions },"Subscribers Fetched successfully"))

})

const getSubscribedChannels = asyncHandler(async (req,res)=>{
    if(!mongoose.isValidObjectId(req.user?._id))
    {
        throw new ApiError(400,"User doesn't exist")
    }
    const subscriptions = await Subscription.find({subscriber:req.user?._id}).populate("channel","username fullName avatar")
    const totalSubscriptions = subscriptions.length
    return res.status(200).json(new ApiResponse(200,{ totalSubscriptions, channels: subscriptions },"Subscribed channels Fetched successfully"))
})
export {subscribeToChannel,unsubscribeFromChannel,getSubscribedChannels,getUserChannelSubscribers}