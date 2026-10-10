import 'dotenv/config';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
import connectDB from './db/index.js';
import { app } from './app.js';
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port", process.env.PORT || 8000);
    });
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });
/*
const app = express();

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error came",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App i running on ${process.env.PORT}`)
        })
    }
    catch(error){
        console.log("error came",error)
        throw error
    }
})()
*/