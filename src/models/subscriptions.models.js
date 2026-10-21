import mongose,{Schema} from "mongoose "

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId, //one who is subscribining
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId, // one to whom subscriber is subscribing
            ref:"User"
        }
    }
    ,{timestamps:true}
)
//Your compound unique index prevents duplicate subscriptions even if two requests arrive simultaneously.
// returns an E11000 duplicate-key error, 
subscriptionSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
);

export const Subscription = mongose.model("Subscription",subscriptionSchema)