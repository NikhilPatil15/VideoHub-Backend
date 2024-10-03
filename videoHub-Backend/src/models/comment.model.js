import {Schema, Model} from 'mongoose'

const commentSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    communityPost:{
        type:Schema.Types.ObjectId,
        ref:"CommunityPost"
    }
},{timestamps:true})

export const Comment = Model("Comment", commentSchema)