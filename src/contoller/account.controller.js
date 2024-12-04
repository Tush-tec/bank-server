import mongoose from "mongoose";
import  {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse } from "../utils/ApiResponse.js"
import { Account } from "../model/accountModel.js";
import {User} from "../model/userModel.js"
import crypto from 'crypto';



// Account Make by Admin
const makeAccount = asyncHandler(async (req, res) => {
  const { account_Type, balance } = req.body;

  if (!( account_Type)) {
    throw new ApiError(400, "All fields are required!");
  }

  if (!["Saving", "Checking", "Business"].includes(account_Type)) {
    throw new ApiError(400, "Invalid account type. Choose Saving, Checking, or Business.");
  }

  const findUser = await User.findById(req.user?._id);
  if (!findUser) {
    throw new ApiError(404, "User not found!");
  }

  const accountExist = await Account.findOne({ account_Holder : req.user._id});
  if (accountExist) {
    throw new ApiError(400, "Account already exists.");
  }

  // const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (!avatar) {
  //   throw new ApiError(400, "Avatar upload failed");
  // }

  const generateAccountNumber = () => {

    const randomBytes = crypto.randomBytes(16).toString('hex');
    return parseInt(randomBytes.substring(0, 10), 16); 
  };

  const accountNumber = generateAccountNumber();

  const createAccount = await Account.create({
    account_Holder: req.user?._id,
    account_Number: accountNumber, 
    account_Type,
    balance,
    // account_avatar: avatar?.url, 
  });

  return res.status(200).json(new ApiResponse(200, createAccount, "Account successfully created."));
});


const getAccountDetails = asyncHandler(async (req, res) => {
  const { accountId } = req.params; 

  if (!accountId) {
    throw new ApiError(400, "Invalid request. Account ID is required!");
  }

  const findAccountDetails = await Account.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(accountId) } 
    },
    {
      $lookup: {
        from: "users", 
        localField: "account_Holder",
        foreignField: "_id", 
        as: "accountHolderDetails", 
        pipeline: [
          {
            $project: {
              name: 1,       
              email: 1,      
              phoneNumber: 1  
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "transactions", 
        localField: "transaction", 
        foreignField: "_id", 
        as: "transactionDetails",
        pipeline: [
          {
            $project: {
              amount: 1,        
              type: 1,          
              payment_method: 1, 
              currency: 1,      
              transactionDate: 1 
            }
          }
        ]
      }
    }
  ]);

  console.log(findAccountDetails);
  

  // If no account details are found
  if (!findAccountDetails || findAccountDetails.length === 0) {
    throw new ApiError(404, "Account not found!");
  }

  // Return the found account details
  return res.status(200).json(
    new ApiResponse(200, findAccountDetails, "Account details fetched successfully!")
  );
});



const deleteAccount = asyncHandler(async(req, res) =>{

  const {accountId} = req.params

  if(!accountId){
    throw new ApiError(400, "invalid Account request!")
  }

  const findAndDelete = await Account.findByIdAndDelete(accountId)

  if(!findAndDelete){
    throw new ApiError(500, "Something went wrong while deleting user!")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      findAndDelete,
      "Account is Permanently Disable!"
    )
  )

})


export {
    makeAccount,
    getAccountDetails,
    deleteAccount
}