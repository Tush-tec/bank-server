import { Router } from "express";

import {

} from "../contoller/card.controller.js"
import { verifyJwtForUser } from "../middleware/userAuth.middleware.js";

const router = Router()
router.use(verifyJwtForUser)

router.route('/').post()


export default router