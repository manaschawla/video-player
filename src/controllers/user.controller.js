
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access token")
    }

}
const registerUser = asyncHandler(async (req, res) => {
//get details from frontend
//validation
//check if  user already exists:username or email
//check for images,check for avatar
//push it to cloudinary
//create user object--create entry in db and check created or not
//remove password and refresh token from response
//check for user creation
//return res

    // Get registration details from the frontend.
    const { fullName, username, email, password } = req.body;

    // Validate required fields.
     if(fullName === "" || username === "" || email === "" || password === ""){
        throw new ApiError(400,"All fields are required")
    }

    // Check whether the username or email is already registered.
    const existedUser = await User.findOne({$or: [{ username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    console.log("req.files", req.files); // Log the uploaded files for debugging.
    // Get the local paths of the uploaded files.
    //The ?. operator is called optional chaining. It prevents an error when a value before it is null or undefined.
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    //req.files — contains the uploaded files.
    //?.avatar — accesses the avatar field if it exists.
    //?.[0] — accesses the first uploaded avatar file because avatar is an array.
    //?.path — retrieves the location where the file was saved.
    // Avatar is mandatory; 
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload images to Cloudinary.
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // Create the user; the User model hashes the password before saving.
    const user = await User.create({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || ""
    });

    // Exclude sensitive fields from the response.
    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    // Send the success response.
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});
const loginUser = asyncHandler(async (req, res) => {
//req body->data
//username or email
//find the user
//password check
//access token and refresh token
//send cookies
 const {username,email,password} = req.body;
 if(!username && !email)
 {
    throw new ApiError(400,"Username or email is required") 
 }
 const user = await User.findOne({$or:[{username},{email}]})

 if(!user)
 {
    throw new ApiError(404,"User doesn't exist")
 }

 const isPasswordValid =  await user.isPasswordCorrect(password)
 if(!isPasswordValid)
 {
    throw new ApiError(404,"User does not exist")
 }
 const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
 const options = {
    httpOnly: true,
    secure: true

 }
 return res.status(200).cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
    new ApiResponse(
        200,{
            user:loggedInUser, accessToken,refreshToken
        },
        "User logged in successfully"
    )
 )

});


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    // Clear the refresh token cookie and send response here
    const options = {
    httpOnly: true,
    secure: true
 }   
 return res.status(200).clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
   try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken)
    {
     throw new ApiError(401,"Refresh Token is Required")
    }
    const decoded_token = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decoded_token?._id)
    if(!user)
    {
     throw new ApiError(401,"Refresh Token is invalid")
    }
    if(incomingRefreshToken !== user?.refreshToken)
    {
     throw new ApiError(401,"Refresh Token is expired or used")
    }
    const options = {
     httpOnly: true,
     secure:true
    }
    const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
     new ApiResponse(200,{accessToken,refreshToken: newrefreshToken},"Access token refreshed")
    )
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
   }
});
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword, confirmPassword} = req.body
    if(newPassword !== confirmPassword)
    {
        throw new ApiError(400,"Passwords do not match")
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Password i not Correct")

    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200,"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} =  req.body;
    if(!fullName || !email)
    {
        throw new ApiError(400,"All fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    return res.status(200).json(
        new ApiResponse(200,user,"User details changed successfully")
    )
});

const updateAvatar = asyncHandler(async(req,res)=>{
const avatarLocalPath = req.file?.path
if(!avatarLocalPath)
{
    throw new ApiError(400,"Avatar file is missing")
}
const avatar = await uploadOnCloudinary(avatarLocalPath)
if(!avatar?.secure_url)
{
    throw new ApiError(400,"Error while uploading Avatar on Cloudinary")
}
 const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
 ).select("-password")
return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
});
    
const updateCoverImage = asyncHandler(async (req,res)=>{
        const coverLocalPath = req.file.path
        if(!coverLocalPath){
            throw new ApiError(400,"Cover image does not exists")
        }
        const coverImage = await uploadOnCloudinary(coverLocalPath)
        if(!coverImage.url)
        {
            throw new ApiError(400,"Error while uploading cover Image on Cloudinary")
        }
        const user = await User.findByIdAndUpdate(req.user?.id,
            {
                $set:{
                    coverImage:coverImage.url
                }
            },
            {new:true}).select("-password")
            return res.status(200).json(new ApiResponse(200,user,"Cover Image updated successfully"))
    });
    const getUserChannelPfofile = asyncHandler(async (req,res)=>{
        const {username} = req.params
        if(!username?.trim())
        {
            throw new ApiError(400,"Username does not exist")
        }
        const channel = await User.aggregate([{
            $match:{
                username:username?.toLowerCase()
            }
        },
    {
        $lookup:
        {
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:
        {
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribed_to"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            ChannelsSubscribedToCount:{
                $size:"$subscribed_to"
            },
            isSubscribed:{
                $cond:{
                    if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else: false
                }
            }
        }
    },
    {
        $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            ChannelsSubscribedToCount: 1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
        }
    }])
    if(!channel?.length)
    {
        throw new ApiError(404,"Channel does not exist")
    }
    return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully"))

    })
    const getWatchHistory = asyncHandler(async (req,res)=>{
        const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                    $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        username:1,
                        avatar:1,
                    }
                }]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
                ]

            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History successfully fetched"))
    })
export { registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateCoverImage,updateAvatar,getUserChannelPfofile,getWatchHistory};
