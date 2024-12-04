import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// ------------------------Routes Declaration ------------------------//

import userRouter from "./routes/userRoutes.js" 
import accountRouter from './routes/accountRoutes.js'
import cardRouter from './routes/cardRoute.js'
import creditRouter from './routes/creditRoutes.js'
import debitRouter from './routes/debitRoutes.js'
import transactionRouter from './routes/txnRoutes.js'

app.use('/api/v1/users', userRouter)
app.use('/api/v1/account', accountRouter)
app.use('/api/v1/card',cardRouter)
app.use('/api/v1/credit',creditRouter)
app.use('/api/v1/debit', debitRouter)
app.use('/api/v1/txn',transactionRouter)

  
// ------------------------Routes for Admin ---------------------------//


import adminRouter from './routes/adminRoutes.js'

app.use('/api/v1/admin', adminRouter)

export{ app }