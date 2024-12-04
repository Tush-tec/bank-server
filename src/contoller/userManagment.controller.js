import mongoose from "mongoose";
import { User } from "../model/userModel.js";
import { Admin } from "../model/adminModel.js";
import { Log } from "../model/log.model.js";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Approved User
// Suspend User

// All Action are performed by admin to userAc ==
//  > so, we have access to userAc, and approved them with verification.
//  > if User Found in any malicious Activity their Ac is Suspended by Admin.
// That's mean Admin have full power upon user Ac.

const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      status: {
        $ne: "Approved",
      },
    },
    { 
      status: "Approved",
    },
    {
      new: true,
      session,
    }
  );

  if (!user) throw new ApiError(404, "User not found or already approved");


  const creationLog = await Log.create(
    [{ admin: adminId, action: "approved_user", details: { userId } }],
    { session }
  );

  await session.commitTransaction();

  console.log(creationLog, session.commitTransaction());
  
  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        creationLog,
        "permission Granted."
    )
  );
});

const suspendUser = asyncHandler(async (req, res) => {
  
  const {userId} = req.params
  const admin = req.admin?._id

  if(!userId){
    throw new ApiError(400, "not found For suspend!")
  }

  const upateStatus = await User.findByIdAndUpdate(
    {
      _id : userId
    },
    {
      $set:{
        status : "suspend",
        suspensionReason : req.body.suspensionReason
      }
    },
    {
      new : true
    }
  )

  if(!upateStatus){
    throw new ApiError(404, "User not found!")
  }

  const creationLog = await Log.create(
   {
    admin: admin,
    action :"Suspended user",
    details: userId, reason: req.body.reason
   }

  )

  // Optionally, send a notification to the user

  return res
  .status(200),
  json(
    new ApiResponse(
     200,
     creationLog,
     "User is suspended" 
    )
  )
});


export {
  approveUser,
  suspendUser
}