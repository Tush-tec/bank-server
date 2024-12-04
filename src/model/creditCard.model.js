import mongoose,{Schema} from "mongoose";


const creditSchema = new Schema(
    {
      cardNumber :{ 
        type:Number,
        required : true,
        unique : true
      },
      user :{
        type : Schema.Types.ObjectId,
        ref :"user"
      },
      credit_limit :{
        type : Number,
        default:0,
        min :0
      },
      outStanding_balance :{
        type:Number,
        default :0,
        min:0
      },
      interest_rate : {
        type : Number,
        default:0
      },
      status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
      },
      expiration_date: {
        type: Date,
        required: true,
      },
    },
    {
        timestamps : true
    }
)

const Credit = mongoose.model("Creadit", creditSchema)

export {Credit}