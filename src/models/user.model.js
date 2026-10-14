import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define the structure and validation rules for users.
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,       // Remove whitespace from both ends.
            lowercase: true,  // Convert username to lowercase.
            unique: true,     // Prevent duplicate usernames through a unique index.
            index: true       // Improve queries that search by username.
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // Stores the Cloudinary image URL.
            required: true
        },
        coverImage: {
            type: String // Stores the optional cover image URL.
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId, // Stores a video's MongoDB ID.
                ref: "Video"                 // References the Video model.
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String // Stores the user's refresh token, if applicable.
        }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt.
);

// Hash the password before saving a new or modified password.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare a login password with the stored password hash.
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate a short-lived access token for authentication.
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate a refresh token to obtain new access tokens.
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Create and export the User model based on the schema.
export const User = mongoose.model("User", userSchema);