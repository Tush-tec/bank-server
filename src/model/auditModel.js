import mongoose,{Schema} from "mongoose";

const auditSchema = new Schema(
    {

      action : {
        type: String,
        required : true
      },
      performedBy:{
        type :Schema.Types.ObjectId,
        ref: "Admin",
        required : true
      },
      target : {
        type : Schema.Types.ObjectId,
        ref : "User"
      },
      details :{
       type : String
      },
    },
    {
        timestamps : true
    }
)

const Audit = mongoose.model("Audit", auditSchema)

export {Audit}