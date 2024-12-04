import { User } from "../model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../middleware/cloudinary.service..js";

const generateAccessorRefreshTokens = async (userId) => {

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    console.log(accessToken);    
    const refreshToken = await user.generateRefreshToken();
    console.log(refreshToken);
    

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating tokens:", error);
    throw new ApiError(500, "Something went wrong while making tokens");
  }
};

console.log("genrateAccessorRefreshTokens", generateAccessorRefreshTokens);


const registerUser = asyncHandler(async (req, res) => {
 
  const { userName, email, fullName, password, phoneNumber } = req.body;
  console.log(req.body);

  console.log("user:",userName, "Email:", email, "fullname:", fullName);


  if (
    [userName, fullName, email, password, phoneNumber].some(
      (valueofField) => valueofField?.trim() === ""
    ) 
  ) {
    throw new ApiError(
      400,
      "All field Are Neccesaary, Please fill it According to Given Field"
    );
  }

  // > check if user already exist

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with Email is already Exists!");
  }

  // > check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path; // Check CONSOLE.LOG WHAT IS COMING


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Files is Required");
  }

    console.log(avatarLocalPath);
     
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar Filed Is Required");
  }
 

  const usercreation = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    phoneNumber,
    avatar: avatar?.url
  });


  const checkUserCreatedorNot = await User.findById(usercreation._id).select(
    "-password -refreshToken"
  );


  if (!checkUserCreatedorNot) {
    throw ApiError(500, "Something Went Wrong While Registrations of user.");
  }

 

  return res
    .status(200)
    .json(
      new ApiResponse(200, checkUserCreatedorNot, "User Register Successful")
    );

});


const loginUser = asyncHandler(async (req, res) => {

    const {userName, password, email} = req.body
    console.log("userName:",userName,"password:",password, "email:", email);
    
    
    if( !(userName || password || email) ){
           throw new ApiError(400,"Invalid Request, Please provide All Details!")
    }

    const findRegisterUser = await User.findOne(
        {
            $or : [{userName}, {email}]
        }
    )

    if(!findRegisterUser){
        throw new ApiError(400, "Invalid request, Please Create User First!")
    }

    const CheckPassword = await findRegisterUser.isPasswordCorrect(password)

    if(!CheckPassword){
        throw new ApiError(400, "Invalid request, Please Check Password and try again!")
    }

    const { accessToken, refreshToken } = await generateAccessorRefreshTokens(
      findRegisterUser._id
  );

  console.log("here is check of generation",{ accessToken, refreshToken });
  

    const loggedInUser = await User.findById(findRegisterUser._id).select(
        "-password -refereshToken"
    );

    const options = {
        httpOnly:true,
        secure : true
    }

    console.log(options);
    

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            loggedInUser,
            accessToken,
            refreshToken,
            "User LoggedIn Successfully!"
        )
    )
});

const logoutUser = asyncHandler(async (req, res) => {

  console.log("Logged in user ID:", req.user?._id); 

  if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request, user not authenticated");
  }

  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1,
          },
      },
      { new: true }
  );

  const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
  };

  return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User LoggedOut Successfully"));
});


const updateUserDetails = asyncHandler(async (req, res) => {

    const {phoneNumber, fullName} = req.body
    
    if(!(phoneNumber || fullName)){
        throw ApiError(400, "Please provide Given Details!")
    }
    
    const findforUpdate = await User.findByIdAndUpdate(req.user?._id)


    if(!findforUpdate){
        throw ApiError(404, "user not found")
    }

    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                phoneNumber, 
                fullName
            }
        },
        {
            new : true
        }
    ).select("-password ")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateUser,
            "user Details Update!"
        )
    )
   
});


const updateUserPassword = asyncHandler(async(req,res) =>{
    const {oldPassWord, newPassword, confirmPassword} = req.body

    const findPasswordforChange = await User.findById(req.user?._id)
    
    const isPasswordCorrect = await findPasswordforChange.isPasswordCorrect(oldPassWord)

    if(isPasswordCorrect){
        throw ApiError(
            403, 
            "Forbidden"
        )
    }

    findPasswordforChange.password = newPassword

    if(newPassword !== confirmPassword){
        throw ApiError(
            401,
            "Unauthorized Request!"
        )
    }

    await findPasswordforChange.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            findPasswordforChange,
            "Password Change Successfully!"
        )
    )
})


const updateUserAvatar  = asyncHandler(async(req,res) => {

    const avatarLocalPath = req.file?.path
    
  
    if(!avatarLocalPath) {
      throw new ApiError(404,"We Cannot Fetch Your Avatar Request")
    }
  
    const user = await User.findById(req.user?._id);
    const currentAvatarUrl = user?.path;
  
  
    if(currentAvatarUrl) {
      await cloudinary.uploader.destroy(publicId)
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
  
  
    if(!avatar.url) {
      throw ApiError(400, "Error While Uploading avatar On Cloudinary")
    }
  
    const updateUser = await User.findByIdAndUpdate(
      req.user?._id,
      
      {
        $set :{
          avatar: avatar?.url
        }
      },
      {
        new :  true
      }
    ).select("-password")
  
    
  
    return res
    .status(200)
    .json(
      new ApiResponse(
        200, user, updateUser, "CoverImage update Successfully."
      )
    )
})

const refereshAccessToken = asyncHandler(async(req,res) =>{

    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
  
    if(!incomingRefreshToken){
      throw new ApiError("401", "unauthorized Request") 
    }
  
    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET )
    
      const user = await User.findById(decodedToken?._id)
    
      if(!user) {
        throw new ApiError(401, " invalid Refresh-Token")
      }
    
      if (incomingRefreshToken  !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is expired or used.")
      }
     
     const {accessToken, newrefreshToken} =  await  genrateAccessorRefreshTokens(user._id)
      
      const options = {
        httpOnly:true,
        secure:true
      }
    
      return res 
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken)
      .json(
        new ApiResponse(
          200,{accessToken, refreshToken : newrefreshToken},"AccessToken Refresh Successfully"
        )
      )
    
    
    
    } catch (error) {
       throw new ApiError(401, error?.message || "invalid refresh Token")
    }
  })  

export {
     registerUser, 
     loginUser, 
     logoutUser, 
     updateUserDetails, 
     updateUserPassword,
     updateUserAvatar, 
     refereshAccessToken,
    };
