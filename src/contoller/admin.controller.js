import mongoose, { isValidObjectId } from "mongoose";
import { Admin } from "../model/adminModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const genrateAccessorRefreshTokensForAdmin = async (AdminId) => {
  try {
    const admin = await Admin.findById(AdminId);

    if (!admin) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating tokens:", error);
    throw new ApiError(500, "Something went wrong while making tokens");
  }
};

console.log("genrateAccessorRefreshTokensForAdmin",genrateAccessorRefreshTokensForAdmin);

const registerAdmin = asyncHandler(async (req, res) => {
  const { admin_name, email, fullName } = req.body;

  console.log(req.body);

  if (
    [admin_name, fullName, email, password].some(
      (valueofField) => valueofField?.trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "All field Are Neccesaary, Please fill it According to Given Field"
    );
  }

  const alreadyExisAdmin = await Admin.findOne({
    $or: [{ admin_name, email }],
  });
  if (alreadyExisAdmin) {
    throw ApiError(400, "admin is Already exist!");
  }

  const adminCreation = await Admin.create({
    admin_name,
    email,
    password,
  });

  const CheckAdminCreated = await Admin.findById(adminCreation._id).select(
    "-password phoneNumber"
  );

  if (!CheckAdminCreated) {
    throw new ApiError(500, "Something went wrong, User Registration Failed!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, CheckAdminCreated, "Admin creation is succefull!")
    );
});

const loginAdmin = asyncHandler(async (req, res) => {


  const { admin_name, email, password } = req.body;
  if (!(admin_name || email || password)) {
    throw new ApiError(404, "userName or Email is required");
  }

  const admin = await Admin.findOne(
    {
       $or: [
          { admin_name }, 
            { email }
       ],
    }
);

  if (!admin) {
    throw new ApiError(404, "User Does not Exist");
  }


  const ValidationofPassword = await admin.isPasswordCorrect(password);

  if (!ValidationofPassword) {
    throw new ApiError(401, "Invalid Admin password");
  }

 const { accessToken, refreshToken } = await genrateAccessorRefreshTokensForAdmin(
    admin._id
  );

  const loggedInUser = await Admin.findById(admin._id).select(
    "-password -refereshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send Respone
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        loggedInUser,
        "User logged in Successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {

    const {admin_name, email} = req.body

    if(!admin_name || !email){
        throw new ApiError(400, "field  must be provided!")
    }

    const findAdmin = await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $unset :{
                refreshToken : 1
            }
        },
        {
            new : true
        }
    )  

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {},
            "user logged-out operation is succesfull!"
        )
    )
});

const updateAdminPassword = asyncHandler(async (req, res) => {

    const {oldpassword, newPassword, confirmPassword} = req.body

    const admin = await Admin.findById(req.admin?._id)

    const isPasswordCorrect = await Admin.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Unauthorized, old password is incorrect!")
    }

    admin.password = newPassword

    if(newPassword !== confirmPassword){
        throw new ApiError(403, "Forbidden Admin Password!")
    }

    await Admin.save({validateBeforeSave :false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            {newPassword},
            "Password change Succesfully"
        )
    )
    
});

const deleteAdmin = asyncHandler(async (req, res) => {

    const {adminId} = req.params

    console.log(adminId);
    
    const loggedinadmin = req.admin?._id

    console.log(loggedinadmin);
    
    const findadmin = await Admin.findById(loggedinadmin)

    if(!findadmin){
        throw new ApiError(404,"Admin not Found!")
    }
    console.log(findadmin);
    

    if(adminId !== loggedinadmin){
         throw ApiError(403, "You're not authorised to delete this account.")
    }



    const deleteAdmin = await Admin.findByIdAndDelete(adminId)

    if(!deleteAdmin){
        throw new ApiError(404, "Admin Account not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "this account is Deleted."
        )
    )
});




export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  updateAdminPassword,
  deleteAdmin,
};
