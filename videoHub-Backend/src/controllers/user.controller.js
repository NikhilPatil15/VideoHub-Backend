import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        // console.log(user);
        const accessToken = user.generateAccessToken();
        // console.log(accessToken);
        const refreshToken = user.generateRefreshToken();
        // console.log(refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    /* 1.get user details from frontend
    2.validation - should not be empty
    3.check if user already exists :username and email
    4.check for images, check for avatar
    5.upload them to cloudinary : avatar
    6.create user object - create entry in db
    7.remove password and  refresh token field from response
    8.check for user creation
      - if yes then return 
      - no then catch block*/

    const { fullName, userName, email, password } = req.body;
    console.log("email: ", email);

    if (
        [fullName, email, userName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required!");
    }
    console.log("req.body", req.body);
    console.log("req.file: ", req.files);
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarResponse) {
        throw new ApiError(400, "Avatar image is required");
    }

    const user = await User.create({
        fullName,
        avatar: {
            public_Id: avatarResponse?.public_id,
            url: avatarResponse?.url,
        },
        coverImage:
            {
                public_Id: coverImageResponse?.public_id,
                url: coverImageResponse?.url,
            } || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    const userCreated = await User.findById(user._id)?.select(
        "-password -refreshToken"
    );

    if (!userCreated) {
        throw new ApiError(
            500,
            "Something went wrong while regestering the user!"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(200, userCreated, "User registered succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    /* 
    1.req.body => data
    2.username or email
    3.find the user
    4.check is user exists in db
    5.check password
    6.if password doesnt match then give warning or error
    7.if correct then generate access and refresh token  
    8.send this tokens through cookies 
    */

    const { userName, email, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "username or email is required");
    }

    /* condition if only one them is needed to login :if(!(userName || email)) */

    const userExists = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!userExists) {
        throw new ApiError(404, "Username does not exists");
    }

    const isPasswordValid = await userExists.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        userExists._id
    );

    const loggedUser = await User.findById(userExists._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged in succesfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const userExists = await User.findById(decodedToken?._id);

        if (!userExists) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== userExists?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(userExists._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshAccessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token refreshed!"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    /* console.log(user);*/
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    /* console.log("old password correct or not: ",isOldPasswordCorrect);*/

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfullly!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account Details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!newAvatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    /* Deleting old avatar image from cloudinary */
    const oldAvatarPublicId = req.user?.avatar.public_Id;

    await deleteFromCloudinary(oldAvatarPublicId, "image");

    const user = await User.findById(req.user?._id).select("-password");

    user.avatar = { public_Id: newAvatar.public_id, url: newAvatar.url };
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully!"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!newCoverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage");
    }
    const oldCoverImageUrl = req.user?.coverImage.public_Id;

    const user = await User.findById(req.user?._id).select("-password");

    if (!oldCoverImageUrl) {
        user.coverImage = {
            public_Id: newCoverImage?.public_id,
            url: newCoverImage?.url,
        };
        await user.save({ validateBeforeSave: false });
    } else {
        const oldCoverImagePublicId = req.user?.coverImage?.public_Id;

        await deleteFromCloudinary(oldCoverImagePublicId, "image");

        user.coverImage = {
            public_Id: newCoverImage?.public_id,
            url: newCoverImage?.url,
        };
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params;

    if (!userName?.trim()) {
        throw new ApiError(400, "Username is not provided!");
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "WatchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $arrayElemAt: ["$owner", 0],
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch History fetched successfully"
            )
        );
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory,
};
