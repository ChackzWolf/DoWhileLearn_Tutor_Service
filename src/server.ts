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
import { configs } from "./Configs/ENV.cofnigs/ENV.configs";
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
        maxFiles: configs.LOG_RETENTION_DAYS
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
        `0.0.0.0:${configs.TUTOR_GRPC_PORT}`,
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
    isBlocked: controller.isBlocked,
    SendOtpToEmail: controller.sendOtpToEmail ,
    ResendOtpToEmail: controller.resendOtpToEmail,
    VerifyOTPResetPassword : controller.VerifyEnteredOTP,
    ResetPassword: controller.resetPassword,
    UploadImage: controller.uploadImage,
    UploadPDF: controller.uploadPDF,
    RegistrationDetails: controller.updateRegistrationDetails,
    FetchTutorDetails: controller.fetchTutorDetails,
    UpdateTutorDetails: controller.updateTutorDetails,
    AddCourseToTutor: controller.addCourseToTutor,
    FetchTutorStudents: controller.fetchStudentIds
})

grpcServer() 
connectDB() 

// Start Kafka consumer
controller.start()
  .catch(error => console.error('Failed to start kafka course service:', error));

const PORT = configs.PORT; 
app.listen(PORT, () => {
  console.log(`Course service running on port ${PORT}`);
});
 
 