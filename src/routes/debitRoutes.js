import { Router } from "express";
import { createDebitCard, deleteDebitCards, depositDebitCard, withdrawFromDebitCard } from "../contoller/debit.controller.js"
import {verifyJwtForUser} from "../middleware/userAuth.middleware.js"
const router = Router()

router.use(verifyJwtForUser)

router.route('/create-debit-card').post(createDebitCard)
router.route('/withdrawal').post(withdrawFromDebitCard)
router.route('/deposit').post(depositDebitCard)
router.route('/delete-debit-card').post(deleteDebitCards)

export default router