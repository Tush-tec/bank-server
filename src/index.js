
import connectWithDb from "./connection/dbConnect.js";
import { app } from "./app.js";


connectWithDb()
.then(()=>{

        app.listen(process.env.PORT,()=>{
        console.log(`server is running on: ${process.env.PORT}`);  
    })
})
.catch((err)=>{
   console.log("MongoDB connection is failed !!", err);
   
})



