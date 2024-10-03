import mongoose,{Schema, Model} from "mongoose";


const likeSchema = new Schema({
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
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const Like = Model("Like", likeSchema)