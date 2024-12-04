import { Router } from "express";
import {
   registerAdmin,
   loginAdmin,
   logoutAdmin,
   updateAdminPassword,
   deleteAdmin
} from "../contoller/admin.controller.js"


const router = Router()

router.route('/register-admin').post(registerAdmin)
router.route('/login-admin').post(loginAdmin)
router.route('/logout-admin').post(logoutAdmin)
router.route('/update-admin').patch(updateAdminPassword)
router.route('delete-admin').delete(deleteAdmin)

export default router