import { isValidObjectId } from "mongoose";
import { CommunityPost } from "../models/communityPost.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";

const uploadCommunityPost = asyncHandler(async (req, res) => {
    /* Short Algo
    1.check if the user is authenticated
    2.if no then send an unauthorized request in reponse
    3.if yes then take title,content and image from the user
    4.if image does not given then create a community post without an image because image is not mandatory!
    5.Create the CommunityPost model by adding values which are given by the user and save it in the database
      */

    const { title, content } = req.body;

    if ([title, content].some((field) => field?.trim() === "")) {
        throw new ApiError(403, "Title and content are essential!");
    }

    const imagelocalpath = req.file?.image[0]?.path;

    if (imagelocalpath) {
        if (!imagelocalpath) {
            throw new ApiError(402, "Please give proper image path!");
        }
        const uploadedImageOnCloudinary =
            await uploadOnCloudinary(imagelocalpath);

        if (!uploadedImageOnCloudinary) {
            throw new ApiError(
                500,
                "Something went wrong while uploading image on cloudinary!"
            );
        }

        const communityPost = await CommunityPost.create({
            title,
            content,
            image: {
                public_id: uploadedImageOnCloudinary.public_id,
                url: uploadedImageOnCloudinary.url,
            },
            owner: req.user?._id,
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    communityPost,
                    "Community post uploaded successfully!"
                )
            );
    }

    const communityPost = await CommunityPost.create({
        title,
        content,
        owner: req.user._id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                communityPost,
                "Community post uploaded successfully!"
            )
        );
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
    /*Short Algo
    1.First check the authentication of the user and proceed if user is authenticated.
    2.get the post id from the params which the use wants to delete
    3.delete the post having that object id which is passed in the params from the database */
    const { id } = req.params;  

    if(!isValidObjectId(id)){
        throw new ApiError(401,"Invalid Community-Post Id")
    }

    if (!id) {
        throw new ApiError(402, "Id is not present");
    }

    const communityPost = await CommunityPost.findById(id);

    if (!communityPost) {
        throw new ApiError(402, "Community post does not exist!");
    }

    if (communityPost.owner?.toString() !== req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot delete this community post, you are unauthorized!"
        );
    }

    await deleteFromCloudinary(communityPost.image.public_id);

    const deletedCommunityPost = await communityPost.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedCommunityPost,
                "Community post deleted successfully!"
            )
        );
});

const getAllPosts = asyncHandler(async (req, res) => {
    /* Give all the posts in the response */
    const allPosts = await CommunityPost.find();

    if (!allPosts) {
        throw new ApiError(500, "Something happened while fetching posts!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allPosts, "All posts fetched successfully!")
        );
});

const updateCommunityPost = asyncHandler(async (req, res) => {
    /* Short Algo 
    1.First check if the user is authenticated if yes then proceed to next steps
    2.get the id of the post which user wants to update from the params
    3.get the title or content or the image field of the communitypost 
    4.update the changed details in the database
     */

    const { id } = req.params;
    const { title, content } = req.body;

    if(!isValidObjectId(id)){
        throw new ApiError(401,"Invalid Community-Post Id")
    }

    if (title.trim() === "" || content.trim() === "") {
        throw new ApiError(401, "Title or content must not be empty!");
    }

    const communityPost = await CommunityPost.findById(id);

    console.log("Community Post: ", communityPost);


    const imageFile = req?.file?.path;
    
    if (imageFile) {
        const updatedCommunityPost = await uploadOnCloudinary(imageFile);

        /* Delete the previous uploaded image from the cloudinary */
        await deleteFromCloudinary(communityPost.image?.public_id, "image");

        communityPost.image?.public_id = updatedCommunityPost?.public_id;
        communityPost.image?.url = updatedCommunityPost?.url;
    }

    (communityPost.title = title), (communityPost.content = content);

    await communityPost.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                CommunityPost,
                "Community Post details updated successfully!"
            )
        );
});

const getSingleCommunityPost = asyncHandler(async (req, res) => {
    /* Get the id of the post from the params and send that post in the response */

    const { id } = req.params;

    if(!isValidObjectId(id)){
        throw new ApiError(401,"Invalid Community-Post Id")
    }

    /* TODO: get the likes and comments and the respective user using aggregation */

    const communityPost = await CommunityPost.findById(id);

    return res
        .status(200)
        .json(200, communityPost, "Community Post Fetched successfully!");
});

export {
    uploadCommunityPost,
    deleteCommunityPost,
    getAllPosts,
    updateCommunityPost,
    getSingleCommunityPost,
};
