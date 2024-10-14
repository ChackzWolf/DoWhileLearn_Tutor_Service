import mongoose from "mongoose";
import { configs } from "../ENV.cofnigs/ENV.configs";
   
const connectDB = async () => {
  try {  
    if (!configs.MONGODB_URL_TUTOR) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }
    console.log(configs.MONGODB_URL_TUTOR)

    await mongoose.connect(configs.MONGODB_URL_TUTOR);
    console.log("Tutor Service Database connected");
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}; 

export { connectDB };   