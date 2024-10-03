import mongoose,{Schema, model} from 'mongoose'


const subscriptionSchema = new Schema({
    subscriber:{    /*One who is subscribing */
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{   /*Subscribed channel */
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription = model("Subscription",subscriptionSchema)
