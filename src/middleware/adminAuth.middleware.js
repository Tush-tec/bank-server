import { Admin } from "../model/adminModel.js";
import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


const verifyJwtForAdmin = asyncHandler(async (req, _, next) => {
  try {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

      console.log("Cookies:", req.cookies);
      console.log("Token:", token);
      
      if (!token) {
          throw new ApiError(401, "Unauthorized Request");
      }
      
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_FOR_ADMIN);

      if (!decodedToken) {
          throw new ApiError(400, "Token verification failed");
      }

      console.log("Decoded Token:", decodedToken);


      const admin = await Admin.findById(decodedToken._id).select("-password -refreshToken");

      if (!user) {
          throw new ApiError(401, "Invalid Access Token");
      }


      req.admin = admin;
      console.log(admin);

      next();
  } catch (error) {

      next(new ApiError(401, error?.message || "Invalid Access Token"));
  }
});

export { verifyJwtForAdmin };
