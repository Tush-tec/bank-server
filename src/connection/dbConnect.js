import mongoose from "mongoose";
import { db_Name } from "../constant.js";
import dotenv from 'dotenv';
dotenv.config();


const connectWithDb = (async ()=>{
   try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_Name}`)

    console.log(` Database integration has been successfully established and now operational on DB Host: ${connectionInstance.connection.host}`);
    
   } catch (error) {
    console.log("Occuring some that is", error);
    
    process.exist(1)
   }
})


export default connectWithDb


// const connectDB = ( async () => {
//     try { 
//       const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//       console.log(`\n mongodb Connected !! DB HOST : ${connectionInstance.connection.host} `);
      

//     } catch (error) {
//         console.error("MonogDb Connection Error",    error);
//         process.exit(1)        
//     }
    
// });

// export default connectDB;



