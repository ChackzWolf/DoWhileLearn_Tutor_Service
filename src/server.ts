import dotenv from "dotenv";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { TutorController }  from "./Controllers/Tutor.controller";
import { connectDB } from "./Configs/DB.configs/MongoDB";
import express from "express"
import morgan from 'morgan';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const app = express()

connectDB()
dotenv.config()

// error log
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine( 
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(), // Log to the console
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '7d' // Keep logs for 14 days
      })
    ],
  });
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
// error log end



const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "protos/tutor.proto"),
    {keepCase:true , longs: String, enums: String , defaults: true, oneofs: true}
)

const tutorProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server()

const grpcServer = () => {
    server.bindAsync(
        `0.0.0.0:${process.env.TUTOR_GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (err,port)=>{
            if(err){
                console.log(err, "Error happened grpc tutor service.");
                return;
            }else{
                console.log("TUTOR_SERVICE running on port", port);
            }
        }
    )
}


export const controller = new TutorController() 

server.addService(tutorProto.TutorService.service, {
    Register: controller.signup,
    VerifyOTP: controller.verifyOtp,
    ResendOTP: controller.resendOtp,
    Login: controller.tutorLogin,
    FetchTutorData: controller.fetchTutors,
    ToggleBlock: controller.blockUnblock,
    AddStudents: controller.addStudent
})

grpcServer() 
connectDB() 
