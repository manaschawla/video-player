import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the structure of video documents in MongoDB.
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary URL of the uploaded video.
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary URL of the video thumbnail.
            required: true
        },
        title: {
            type: String, // Title displayed to viewers.
            required: true
        },
        description: {
            type: String, // Information about the video.
            required: true
        },
        duration: {
            type: Number, // Video duration, typically in seconds.
            required: true
        },
        views: {
            type: Number,
            default: 0 // New videos start with zero views.
        },
        isPublished: {
            type: Boolean,
            default: true // Videos are published by default.
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // References the user who uploaded the video.
        }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt.
);

// Adds pagination support to MongoDB aggregation queries.
videoSchema.plugin(mongooseAggregatePaginate);

// Create and export the Video model.
export const Video = mongoose.model("Video", videoSchema);