import { Router } from "express";
import { cancelTransaction, getTransactionDetail, getUserTransactionHistory, initTransaction } from "../contoller/txnController.js"
import {verifyJwtForUser} from '../middleware/userAuth.middleware.js'

const router = Router()

router.use(verifyJwtForUser)

router.route('/initiate-transaction').post(initTransaction)
router.route('/transaction-details').get(getTransactionDetail)
router.route('/cancel-transaction').put(cancelTransaction)
router.route('/user-transaction').get(getUserTransactionHistory)

export default router