import { CommunityPost } from "../models/communityPost.model.js";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";

const uploadCommunityPost = asyncHandler(async (req, res) => {
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
    const { id } = req.params;

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

export { uploadCommunityPost, deleteCommunityPost, getAllPosts };
