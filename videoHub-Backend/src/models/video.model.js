import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate'
const videoSchema = new Schema({
    videoFile:{
        public_Id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    thumbnail:{
        public_Id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema);
