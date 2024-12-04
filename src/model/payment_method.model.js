import mongoose,{Schema} from "mongoose";

const  pg_method = new Schema (
    {
      user_id :{
        type : Schema.Types.ObjectId(),
        ref: "User"
      },
     payment_type:{
        type :  String,
        required : true,
        enum : ["CreditCard", "DebitCard", "Upi", 'Cash'],
        default : Cash
     },
    //  Card :{
    //     type : Schema.Types.ObjectId(),
    //     ref :"Card"
    //  }
    },
    {
        timestamps:true
    }
) 

const PaymentMethod = mongoose.model ("PaymentMethod", pg_method)

export {PaymentMethod}