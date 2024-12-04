import mongoose,{Schema} from "mongoose";


const notificationSchema = new Schema(
    {
      user : {
        type :Schema.Types.ObjectId,
        ref :"User",
        required : true
      },
      message : {
        type : String,
        required : true
      },
      type: { 
        type: String, 
        enum: ['Info', 'Warning', 'Critical'], default: 'Info'
      },
      read :{
        type :Boolean,
        default : true
      },
      createdAt :{
        type : Date,
        default : Date.now
      }


    },
    {
        timestamps: true
    }
)

const Notification =mongoose.model("Notification", notificationSchema)

export {Notification}