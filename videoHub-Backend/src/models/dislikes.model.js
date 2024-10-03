import mongoose, {Schema, model} from "mongoose";

const dislikeSchema = new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    communityPost:{
        type:Schema.Types.ObjectId,
        ref:"CommunityPost"
    },
    dislikedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Dislike = model("Dislike", dislikeSchema)