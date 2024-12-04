import mongoose,{Schema} from "mongoose";

const logSchema  = new Schema (
    {
        admin: {
            type:Schema.Types.ObjectId,
            ref :"Admin"
        },
        action :{
            type :String,
            required : true
        },
        details : {
         type : Object
        }
    },{timestampsL: true}
)

const Log = mongoose.model("Log", logSchema)

export {Log}