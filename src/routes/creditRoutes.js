import { Router } from "express";
import { chargeCreditCard, createCreditCard, deactivateCreditCard, getAllCreditCardsForUser, updateCreditCard } from "../contoller/credit.controller.js"
import { verifyJwtForUser } from "../middleware/userAuth.middleware.js";
import { makeAccount } from "../contoller/account.controller.js";


const router = Router()

router.use(verifyJwtForUser)

router.route('/create-credit-card').post(createCreditCard)
router.route('/update-credit-card').post(updateCreditCard)
router.route('/deactive-credit-card').post(deactivateCreditCard)
router.route('/charge-credit-card').post(chargeCreditCard)
router.route('/payment').post(makeAccount)
router.route('/all-cards').post(getAllCreditCardsForUser)

export default router