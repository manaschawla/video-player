import 'dotenv/config';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import connectDB from './db/index.js';

await connectDB();
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