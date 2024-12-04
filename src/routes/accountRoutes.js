import { Router } from "express";
import {
    makeAccount,
    getAccountDetails,
    deleteAccount
} from "../contoller/account.controller.js"
import { verifyJwtForUser } from "../middleware/userAuth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const router = Router()

router.use(verifyJwtForUser)


router
 .route('/create-account')
 .post(
    asyncHandler(async(req,res) =>{
        const  {accountType} =  req.query
        
        if(!accountType){
            throw new ApiError(
                400,
                "Account type is required as a query parameter!"
            )
        }
        req.body.accountType= accountType

        return makeAccount(req,res)
    })
 )

router.route('/account-details/:accountId').get(getAccountDetails)
router.route('/delete-account').delete(deleteAccount)



export  default router