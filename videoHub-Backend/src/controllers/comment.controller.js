import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import {CommunityPost} from '../models/communityPost.model.js'

const addVideoComment = asyncHandler(async (req, res) => {
    /* Just take the comment  from the body and video id from the params and then check if the video exists is yes then only add the comment for that video in the database! */
    const { content } = req.body;
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Video Id!");
    }

    if (content.trim() === "") {
        throw new ApiError(401, "Content must not be empty!");
    }

    const checkVideo = await Video.findById(videoId);

    if (!checkVideo) {
        throw new ApiError(401, "Video does not exist!");
    }

    const comment = await Comment.create({
        content: content,
        owner: req.user?._id,
        video: videoId,
    });

    if (!comment) {
        throw new ApiError(
            401,
            "Something went wrong while adding the comment!"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully!"));
});

const updateVideoComment = asyncHandler(async (req, res) => {
    /* Just take the comment as the input and update that comment and take the videoId from the params, update the comment after checking that the video exists or not! */

    const { videoId } = req.params;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Video id!");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid Comment id!");
    }

    if (content.trim() === "") {
        throw new ApiError(401, "Content must not be empty!");
    }

    const checkVideo = await Video.findById(videoId);
    const checkComment = await Comment.findById(commentId);

    if (!checkVideo) {
        throw new ApiError(401, "Video does not exist!");
    }
    if (!checkComment) {
        throw new ApiError(401, "Comment does not exist!");
    }

    if (checkComment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "You does not have access to update this comment!"
        );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content,
            },
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(401, "Something went wrong while updating comment!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "Comment updated successfully!"
            )
        );
});

const deleteVideoComment = asyncHandler(async (req, res) => {
    /* Just get the videoId and commentId from the params and check if the video and comment exists if then delete the comment */
    const {commentId} = req.params
    const {videoId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid Comment Id!")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid Video Id!")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(401,"Video does not exist!")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(401,"Comment does not exist!")
    }

    return res.status(200).json(new ApiResponse(200,deleteVideoComment,"Comment deleted successfully!"))
})

const addCommunityPostComment = asyncHandler(async (req, res)=>{
    /* Follow the same logic as the video one */

    const {communityPostId} = req.params
    const {content} = req.body

    if(!isValidObjectId(communityPostId)){
        throw new ApiError(401,"Invalid communityPost Id!")
    }

    if(content.trim()===""){
        throw new ApiError(401,"Content should not be empty!")
    }

    const communityPost = await CommunityPost.findById(communityPostId)

    if(!communityPost){
        throw new ApiError(401,"Community post does not exist!")
    }

    const comment = await Comment.create({
        communityPost:communityPostId,
        content:content,
        owner:req.user?._id
    })

    if(!comment){
        throw new ApiError(401,"Something went wrong while adding comment!")
    }

    return res.status(200).json(new ApiResponse(200,comment,"comment Added successfully!"))
})

const updateCommunityPostComment = asyncHandler(async(req, res) => {
    /* follow the same logic as the video one */
    const {commentId} = req.params
    const {communityPostId} = req.params
    const {content} = req.body
    
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid comment Id!")
    }

    if(!isValidObjectId(communityPostId)){
        throw new ApiError(401,"Invalid CommunityPost Id!")
    }

    if(content.trim()===""){
        throw new ApiError(401,"Content should not be empty!")
    }

    const communityPost = await CommunityPost.findById(communityPostId)

    if(!communityPost){
        throw new ApiError(401,"Community post does not exist!")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(401,"Comment does not exist!")
    }

    comment.content = content
    const updatedComment = await comment.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfully!"))
    
})

const deleteCommunityPostComment = asyncHandler(async(req, res)=>{
    /* just follow the same logic as the video one */
    
    const {commentId} = req.params
    const {communityPostId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid Comment Id!")
    }

    if(!isValidObjectId(communityPostId)){
        throw new ApiError(401,"Invalid Community post Id!")
    }

    const communityPost = await CommunityPost.findById(communityPostId)

    if(!communityPost){
        throw new ApiError(401,"Community Post does not exist!")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(401,"Comment does not exist!")
    }

    return res.status(200).json(new ApiResponse(200,comment,"Comment deleted successfully!"))
})

export{
    addVideoComment,
    updateVideoComment,
    deleteVideoComment,
    addCommunityPostComment,
    updateCommunityPostComment,
    deleteCommunityPostComment
}