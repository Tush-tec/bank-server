import mongoose from "mongoose";
import { Transaction } from "../model/txnModel.js";
import { User } from "../model/userModel.js";
import { Account } from "../model/accountModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//----------------------- Transaction between two user ------------------------//
const initTransaction = asyncHandler(async (req, res) => {

  const {
    user_id,
    sender_account,
    receiver_account,
    payment_method,
    amount,
    currency,
    type,
    fee,
    remarks,
  } = req.body;

  if (!(user_id && payment_method && amount && currency)) {
    throw new ApiError(400, "Bad request, Missing Field Required!");
  }

  if (amount <= 0) {
    throw new ApiError(400, "Invalid amount. It must be greater than zero.");
  }

  const user = await User.findById(user_id);
  if (!user) {
    throw new ApiError(400, "User doesn't exist!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let senderAc = null,
      receiverAc = null;

    if (sender_account) {
      senderAc = await Account.findById(sender_account).session(session);
      if (!senderAc || senderAc.account_Holder.toString() !== user._id.toString()) {
        throw new ApiError(404, "Sender Account not found!");
      }
      const totalDeduction = amount + (fee || 0);
      if (senderAc.balance < totalDeduction) {
        throw new ApiError(400, "Insufficient balance in sender's account!");
      }
    }

    if (receiver_account) {
      receiverAc = await Account.findById(receiver_account).session(session);
      if (!receiverAc || receiverAc.account_Holder.toString() !== user._id.toString()) {
        throw new ApiError(404, "Receiver Account not found!");
      }
    }


    if (senderAc) {
      senderAc.balance -= amount + (fee || 0);
      await senderAc.save({ session });
    }

    if (receiverAc) {
      receiverAc.balance += amount;
      await receiverAc.save({ session });
    }

    // Create a new transaction
    const createTransaction = await Transaction.create(
      [
        {
          user_id,
          payment_method,
          amount,
          currency,
          type,
          fee,
          sender_account: senderAc ? senderAc._id : null,
          receiver_account: receiverAc ? receiverAc._id : null,
          status: "Pending", 
          remarks,
          transactionSource: "Internal", 
        },
      ],
      { session }
    );

    if (createTransaction.length === 0) {
      throw new ApiError(500, "Transaction not initiated!");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // const updatedTransaction = await updateTransactionStatus( createTransaction[0].txnId,"Completed");

    return res
    .status(201)
    .json(
      new ApiResponse(201, cancelTransaction, "Transaction initiated successfully!")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw new ApiError(500, error.message || "Transaction failed!");
  }

  // Todo: Add notification method or Audit log
});

const getTransactionDetail = asyncHandler(async (req, res) => {

  const { txnId } = req.params;

  if (!txnId) {
    throw new ApiError(400, "Transaction ID is required!");
  }

  const transaction = await Transaction.findOne({ txnId });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transaction,
        "Transaction details retrieved successfully!"
      )
    );
});

const cancelTransaction = asyncHandler(async (req, res) => {
  const { txnId } = req.params;


    const txn = await Transaction.findOne({ txnId });
    if (!txn) {
      return next(new ApiError(404, "Transaction not found"));
    }

    if (txn.status !== "Pending") {
      return next(new ApiError(400, "Cannot cancel non-pending transaction"));
    }

    txn.status = "Cancelled";
    await txn.save();

    return res
    .status(200)
    .json(
       new ApiResponse(
        201,
        txn,
        "Transcation is cancelled!"
       )
    )
  
});

const getUserTransactionHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;  
  const { startDate, endDate } = req.query;  

  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  console.log(userId);
  
  const transactions = await Transaction.aggregate([

    {
      $match: {
        $or: [
          { sender_account: userId },  
          { receiver_account: userId },
        ],
        ...(startDate && endDate ? {
          transactionDate: {
            $gte: new Date(startDate), 
            $lte: new Date(endDate),   
          }
        } : {})
      }
    },
    {
      $lookup: {
        from: "accounts", 
        localField: "sender_account",
        foreignField: "_id", 
        as: "sender_account_details"
      }
    },
    {
      $lookup: {
        from: "accounts",
        localField: "receiver_account",
        foreignField: "_id",
        as: "receiver_account_details"
      }
    },
    {
      $project: {
        _id: 1,
        amount: 1,
        currency: 1,
        transactionDate: 1,
        sender_account_details: { 
          accountNumber:1, 
          accountHolder: 1 
        },
        receiver_account_details: 
        { 
          accountNumber, 
          accountHolder: 1 
        },
        status: 1,
        type: 1,
        remarks: 1,
      }
    },
    {
      $sort: { transactionDate: -1 } 
    }
  ]);

  if (transactions.length === 0) {
    throw new ApiError(404, "No transaction found!")
  }

  return res
  .status(201)
  .json(
    new ApiResponse(
      200,
      transactions,
      "Here is your transaction details"
    )
  );
});

export{
  initTransaction,
  getTransactionDetail,
  cancelTransaction,
  getUserTransactionHistory
}
