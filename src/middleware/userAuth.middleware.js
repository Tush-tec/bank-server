import { User } from "../model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJwtForUser = asyncHandler(async (req, _, next) => {

  try {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    console.log( req.cookies?.accessToken);
    console.log(req.header("Authorization")?.replace("Bearer ", ""));
    
    

    console.log("Token",token);

    
      if (!token) {
          throw new ApiError(401, "Unauthorized Request: No token provided");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      if (!decodedToken) {
          throw new ApiError(401, "Invalid Access Token");
      }

      const user = await User.findById(decodedToken._id).select("-password -refreshToken");

      if (!user) {
          throw new ApiError(401, "User not found with provided token");
      }

      req.user = user;
      next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
          return next(new ApiError(401, "Access token has expired"));
      }
      
      next(error);
  }
});

  
  export  {verifyJwtForUser}


  