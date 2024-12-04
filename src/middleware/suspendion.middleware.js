import { ApiError } from "../utils/ApiError";



const checkSuspensionAndRolePermissions = (req, res, next) => {
    if (req.user.status === "Suspended") {
      return res.status(403).json({
        message: "Your account is suspended. Please contact support.",
      });
    }
  

    if (req.user.role === "Admin" && !req.user.permissions.includes("manage_users")) {
        throw new ApiError(400, "Insuffiecient permission to Access this function!")
    } 
    next();
  };


  export {checkSuspensionAndRolePermissions}
  