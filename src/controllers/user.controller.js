
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
