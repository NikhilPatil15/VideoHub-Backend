import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/likes.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    /* Short Algo
    1.Check if user is authenticated and is yes then only proceed to further steps
    2.get the videoId from the params on which liking should be performed
    3.check if the video is already liked by the same user and if yes then delete the video from the like model
    4.if no then save the video and user id in the database and marked the video as a liked video
     */

    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Video Id");
    }

    const isLiked = await Like.findOne({ video: videoId });

    if (isLiked) {
        const deleteLike = await Like.deleteOne({ video: videoId });

        if (!deleteLike) {
            throw new ApiError(
                401,
                "Something went wrong while deleting Like!"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLike, "Like deleted successfully!")
            );
    }

    const likeVideo = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (!likeVideo) {
        throw new ApiError(401, "Something went wrong while liking the video!");
    }

    return res.status(200).json(200, likeVideo, "Video Liked successfully!");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    /* Follow all the steps as the toggleVideoLike function */

    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid Comment Id");
    }

    const isLiked = await Like.findOne({ comment: commentId });

    if (isLiked) {
        const deleteLike = await Like.deleteOne({ comment: commentId });

        if (!deleteLike) {
            throw new ApiError(
                401,
                "Something went wrong while deleting the like"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLike, "Like deleted Successfully!")
            );
    }

    const likeComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (!likeComment) {
        throw new ApiError(
            401,
            "Something went wrong while liking the comment!"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likeComment, "Comment liked successfully!"));
});

const toggleCommunityPostLike = asyncHandler(async (req, res) => {
    /* follow all the steps which are followed in previous two functions i.e likeVideo and likeComment */

    const { communityPostId } = req.params;

    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(401, "Invalid CommunityPost Id!");
    }

    const isLiked = await Like.findOne({ communityPost: communityPostId });

    if (isLiked) {
        const deleteLike = await Like.deleteOne({
            communityPost: communityPostId,
        });

        if (!deleteLike) {
            throw new ApiError(
                401,
                "Something went wrong while deleting like!"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLike, "Like deleted successfully!")
            );
    }

    const likeCommunityPost = await Like.create({
        communityPost: communityPostId,
        likedBy: req.user?._id,
    });

    if (!likeCommunityPost) {
        throw new ApiError(
            401,
            "Something went wrong while liking the community post!"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeCommunityPost,
                "Community Post liked successfully!"
            )
        );
});

/* TODO: add a getAllLiked Videos,communityPosts and comments by performing aggregation */

export { toggleVideoLike, toggleCommentLike, toggleCommunityPostLike };
