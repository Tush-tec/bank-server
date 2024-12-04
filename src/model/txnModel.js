import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from 'uuid'; 

const txnSchema = new Schema(
  {

   user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_account: { 
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
    receiver_account: {  
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
    payment_method: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be greater than or equal to 0"],
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "INR", "EUR", "GBP", "JPY", "AUD"],
      default: "INR",
    },
    status: {
      type: String,
      required: true,
      enum: ["Success", "Pending", "Failed", "Cancelled"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["Success", "Pending", "Failed", "Cancelled"],
      default: "Pending",
    },
    fee: {  
      type: Number,
      default: 0,
    },
    transactionDate: { 
      type: Date,
      default: Date.now
    },
    transactionSource: {  
      type: String,
      enum: ["Internal", "External"],
      required: true,
      default: "Internal",
    },
    remarks: {
      type: String,
      default: "",
    },
    createdBy: { 
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedBy: {  
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: {  
      type: String,
    },
    device: {  
      type: String,
    },
  },
  {
    timestamps: true,  
  }
);

const Transaction = mongoose.model("Transaction", txnSchema);

export { Transaction };
