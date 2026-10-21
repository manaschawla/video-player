import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        playlistName:{
            type:String,
            required:true,
            trim:true,
            index:true,
            minlength: 1
        },
        videos:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        description:{
        type: String,
        trim: true,
        default: ""
        }
    }
    ,{timestamps:true})

    export const Playlist = mongoose.model("Playlist",playlistSchema)