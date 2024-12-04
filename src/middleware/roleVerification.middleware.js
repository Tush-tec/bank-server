import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../model/adminModel.js";

const verifyUserAccess = (requiredPermission) => asyncHandler(async (req, res, next) => {
    const admin = req.admin; 

    if (!admin) {
        return res.status(401).json({ message: "Unauthorized request!" });
    }

    if (admin.role !== "Admin") {
        return res.status(403).json({ message: "Access denied: Admin role is required!" });
    }

    if (!admin.permissions || !admin.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access denied: Insufficient permission!" });
    }


    next();
});

export { verifyUserAccess };
