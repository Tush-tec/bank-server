import mongoose,{Schema} from "mongoose";


const debitSchema = new Schema(
    {
        cardNumber : {
        type: String,
        required : true,
        unique : true,
       },
       user :{
        type : Schema.Types.ObjectId,
        ref : "Account",
        required : true
       },
       balance : {
        type : Number,
        default: 0,
        required : true
       },
       status :{
        type : String,
        enum :['active', 'deactive'],
        required : true
       },
       expirationDate : {
        type : Date,
        required : true
       }

    },
    {
        timestamps: true
    }
)

const Debit  = mongoose.model("Debit", debitSchema)

export {Debit}