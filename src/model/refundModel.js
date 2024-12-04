import mongoose, {Schema} from "mongoose";

const refundSchema = new Schema(
    {
     transcation_id :{
        type :Schema.Types.ObjectId(),
        ref :"Transcation"
     },
     user_id : {
        type :Schema.Types.ObjectId(),
        ref :"User"
     },
     refund_Amount : {
        type:Number,
        required: true
     },
     reason_for_refund : {
        type : String,
        required:true
     },
     status : ["Processing", "Pending", "Denied", "Failed"],
     default : "Pending"
    },
    {
        timestamps: true 
    }
)

const Refund = mongoose.model("Refund", refundSchema)