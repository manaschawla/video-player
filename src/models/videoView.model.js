
import mongoose, { Schema } from "mongoose";

const videoViewSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Helps retrieve view history for a creator's videos by date.
videoViewSchema.index({ owner: 1, createdAt: 1 });

export const VideoView = mongoose.model("VideoView", videoViewSchema);
