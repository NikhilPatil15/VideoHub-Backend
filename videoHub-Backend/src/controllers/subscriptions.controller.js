import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    /* get the channel id from the params and then check if the channel is already subscribed by the user if yes then delete previous subscription or if no then  create a subscription document and add it to the database */

    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channel ID!");
    }

    const isSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id,
    });

    if (isSubscribed) {
        const deleteSubscription = await Subscription.findByIdAndDelete(
            isSubscribed?._id
        );

        if (!deleteSubscription) {
            throw new ApiError(
                401,
                "Something went wrong while deleting Subscription!"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deleteSubscription,
                    "Subscription deleted successfully!"
                )
            );
    }

    const subscription = await Subscription.create({
        subscriber: req?.user?._id,
        channel: channelId,
    });

    if (!subscription) {
        throw new ApiError(
            401,
            "Something went wrong while adding subscription!"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscription,
                "Subscription added successfully!"
            )
        );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channel id!");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscription",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscriberOfCurrentUserChannel",
                        },
                    },
                    {
                        $addFields: {
                            isubscibedToChannel: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscriberOfCurrentUserChannel.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            totalSubscribers: {
                                $size: "$subscriberOfCurrentUserChannel",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind:'$subscriber'
        },
        {
            $project:{
                _id:0,
                subscriber:{
                    username:1,
                    _id:1,
                    fullName:1,
                    'avatar.url':1,
                    subscriberOfCurrentUserChannel:1,
                    totalSubscribers:1,
                }
            }
        }
    ]);

    console.log("Aggregation Results: ", subscribers);

    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers fetched successfully!"))
    
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subsciberId} = req.params

    if(!isValidObjectId(subsciberId)){
        throw new ApiError(401,"Invalid Subscriber Id!")
    }

    /* TODO:Complete this aggregation pipeline */
    // const getSubscribedChannels = await Subscription.aggregate([{
    //     $match:{
    //         subscriber:new mongoose.Types.ObjectId(subsciberId)
    //     }
    // },
    //     {
    //         $lookup:{
    //             from:'users',
    //             localField:'channel',
    //             foreignField:'_id',
    //             as:'subscribedChannels',
    //             pipeline:[

    //             ]
    //         }
    //     }
    // ])
})
