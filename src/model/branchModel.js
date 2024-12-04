import mongoose,{Schema} from "mongoose";

const brachSchema = new Schema(
    {
        branch_code :{
            type:String,
            unique : true,
            required : true
        },
        branch_Name :{
            type: Number,
            required: true
        },
        address : {
            type : String
        },
        contact : {
            type:Number
        }
    },
    {
        timestamps:true
    }
)

const Branch = mongoose.model("Branch", brachSchema)

export {Branch}