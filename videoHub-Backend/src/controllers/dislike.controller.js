import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from '../utils/apiResponse.js'
import { Dislike } from "../models/dislikes.model.js";

const toggleDislikeVideo = asyncHandler(async (req, res) => {
    /* Short Algo
    1.Check if user is authenticated and is yes then only proceed to further steps
    2.get the videoId from the params on which disliking should be performed
    3.check if the video is already disliked by the same user and if yes then delete the video from the dislike model
    4.if no then save the video and user id in the database and marked the video as a disliked video
     */

    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid videoId!")
    }

    const isDisliked = await Dislike.findOne({video:videoId})

    if(isDisliked){
       const deleteDislike = await Dislike.deleteOne({video:videoId}) 

       if(!deleteDislike){
        throw new ApiError(401,"Something went wrong while deleting dislike!")
       }

       return res.status(200).json(new ApiResponse(200,deleteDislike,"Dislike removed successfully!"))
    }

    const dislikeVideo = await Dislike.create({
        video:videoId,
        dislikedBy:req.user?._id
    })

    if(!dislikeVideo){
        throw new ApiError(401,"Something went wrong while disliking the video!")
    }

    return res.status(200).json(new ApiResponse(200,dislikeVideo,"Video disliked successfully!"))
});

const toggleDislikeComment = asyncHandler(async (req, res)=>{
    /* Follow all the steps as the video disliking function */

    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid comment Id!")
    }

    const isDisliked = await Dislike.findOne({comment:commentId})

    if(isDisliked){
        const deleteDislike = await Dislike.deleteOne({comment:commentId})

        if(!deleteDislike){
            throw new ApiError(401,"Something went wrong while deleting the dislike!")
        }

        return res.status(200).json(new ApiResponse(200,deleteDislike,"Disliked deleted successfully!"))
    }

    const dislikeComment = await Dislike.create({
        comment:commentId,
        dislikedBy:req.user?._id
    })

    if(!dislikeComment){
        throw new ApiError(401,"Something went wrong while disliking comment!")
    }

    return res.status(200).json(new ApiResponse(200,dislikeComment,"Comment disliked successfully!"))
})

const toggleDislikeCommunityPost = asyncHandler(async (req, res) => {
    /* follow same steps as the video and comment one */

    const {communityPostId} = req.params

    if(!isValidObjectId(communityPostId)){
        throw new ApiError(401,"Invalid CommunityPost Id!")
    }

    const isDisliked = await Dislike.findOne({communityPost:communityPostId})

    if(isDisliked){
        const deleteDislike = await Dislike.deleteOne({communityPost:communityPostId})

        if(!deleteDislike){
            throw new ApiError(401,"Something went wrong while deleting dislike!")
        }

        return res.status(200).json(new ApiResponse(200, deleteDislike, "Dislike removed successfully!"))
    }

    const dislikeCommunityPost = await Dislike.create({
        communityPost:communityPostId,
        dislikedBy:req.user?._id
    })

    if(!dislikeCommunityPost){
        throw new ApiError(401,"Something went wrong while disliking community post!")
    }

    return res.status(200).json(new ApiResponse(200, dislikeCommunityPost, "Community Post disliked successfully!"))
})

export{
    toggleDislikeVideo,
    toggleDislikeComment,
    toggleDislikeCommunityPost
}
