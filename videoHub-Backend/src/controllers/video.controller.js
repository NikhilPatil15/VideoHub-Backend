import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    /* short Algo
    1.Take input from the req
    2.checks if all fields are given 
    3.if not then send a error response
    4.if yes then check if title exists in the db
    5.if yes then send a error response 
    6.if not then succesfully upload the video file and thumbnail on the cloudinary 
    7.send success response and add all the fields in to the database
    */

    const { title, description } = req.body;

    if (title.trim() === "") {
        throw new ApiError(401, "Title is required");
    }

    console.log("Body: ", req.body);
    console.log("Files: ", req.files);

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "video and thumbnail are required");
    }

    const videoResponse = await uploadOnCloudinary(videoLocalPath);
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoResponse || !thumbnailResponse) {
        throw new ApiError(500, "something went wrong while uploading!");
    }

    // console.log("Cloudinary Response for video : ", videoResponse.duration);

    const video = await Video.create({
        title,
        description,
        videoFile: {
            public_Id: videoResponse.public_id,
            url: videoResponse.url,
        },
        thumbnail: {
            public_Id: thumbnailResponse.public_id,
            url: thumbnailResponse.url,
        },
        duration: videoResponse.duration,
        owner: req.user._id,
        isPublished: true,
    });

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(
            500,
            "Something went wrong while uploading information into database"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, videoUploaded, "Video Uploaded succesfully")
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    /* short algo for deleting video
    1.get the videoId from the params 
    2.select that video from the database with the help of its id
    3.check if the video exists 
    4.if not then give error 
    5.if yes then delete the video and thumbnail files from the cloudinary first with the help of public id
    6.delete the document
    */

    const { id } = req.params;

    const videoExists = await Video.findById(id);

    if (!videoExists) {
        throw new ApiError(400, "Video doesnt exist!");
    }

    console.log("video : ", videoExists);

    console.log("Video public id:", videoExists.videoFile.public_Id);

    if (videoExists?.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You cannot delete this video as you are not the owner."
        );
    }

    await deleteFromCloudinary(videoExists.videoFile.public_Id, "video");
    await deleteFromCloudinary(videoExists.thumbnail.public_Id, "image");

    const deletedVideo = await videoExists.deleteOne();

    if (!deletedVideo) {
        throw new ApiError(500, "Something went wrong while deleting!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteVideo, "Video deleted successfully!"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    /* short algo for updating videoDetails
    1.get the fields from the frontend which needs to be updated
    2.check for the title because the title is necessary
    3.if not given then do not change it 
    4.if yes then update it 
    5.check if the thumbnail is given to get updated
    6. if not given then it will remain as it is
    7. if given then delete the first thumbnail from the cloudinary with the help of the public id
    8. upload the new given thumbnail in cloudinary and then update the fields of thubnail like url and public id
    */
    const { title, description } = req.body;
    const { id } = req.params;

    // console.log("Title:", title, "Description: ", description);

    if (!title.trim() === "") {
        throw new ApiError(401, "Title must not be empty!");
    }

    const video = await Video.findById(id);

    // console.log("req.files: ", req.file);

    const thumbnailFile = req.file?.path;

    // console.log("ThumbnailFile: ", thumbnailFile);

    if (thumbnailFile) {
        const updatedThumbnail = await uploadOnCloudinary(thumbnailFile);

        await deleteFromCloudinary(video.thumbnail.public_Id, "image");

        video.thumbnail.public_Id = updatedThumbnail.public_id;
        video.thumbnail.url = updatedThumbnail.url;

        // console.log("Thumbnail public id: ", updatedThumbnail.public_id);

        // await video.save({ validateBeforeSave: false });
    }

    video.title = title;
    video.description = description;

    await video.save({ validateBeforeSave: false });

    // console.log("Update Video results : ", updatedVideoResults);
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video details updated successfully!")
        );
});

const getAllVideos = asyncHandler(async (req, res) => {
    /* fetch all the videos from the database by doing find */
    const videos = await Video.find();

    console.log("All videos: ", videos);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched succesfully"));
});

const getSingleVideo = asyncHandler(async (req, res) => {
    /* short algo for finding a single video
    1.get the video id from the params
    2.fetch the video of the respected id */

    const { id } = req.params;

    // console.log("Valid: ", mongoose.Types.ObjectId.isValid(id));

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(401, "Video does not exist in the database!");
    }

    console.log("Fetched Video : ", video);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const addView = asyncHandler(async (req, res) => {
    /* simply get the id from the params and then fetch that document and increase the views field by 1 */
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
    );

    

    console.log("Views: ", video.views);

    if (!video) {
        throw new ApiError(
            500,
            "Something went wrong while updating view count"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "View added successfully"));
});

const trendingVideos = asyncHandler(async (req, res) => {
    /* fetch the videos one the basis of their view count */

    const trending = await Video.find().sort({ views: -1 });

    if (!trending) {
        throw new ApiError(
            500,
            "Somthing went wrong while fetching trending videos!"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                trending,
                "Trending Videos fetched successfully!"
            )
        );
});

export {
    uploadVideo,
    deleteVideo,
    updateVideoDetails,
    getAllVideos,
    getSingleVideo,
    addView,
    trendingVideos,
};
