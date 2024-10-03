import mongoose, { Schema } from "mongoose";

const communityPostSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        title: {
            type: String,
            unique: true,
            required: true,
        },
        content: {
            type: String,
        },
        image: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

export const CommunityPost = mongoose.model(
    "CommunityPost",
    communityPostSchema
);
