import dotenv from "dotenv";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { TutorController }  from "./Controllers/Tutor.Controller";
import { connectDB } from "./Configs/DB.configs/MongoDB";
import express from "express"
import morgan from 'morgan';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { configs } from "./Configs/ENV.cofnigs/ENV.configs";
import { TutorService } from "./Services/Tutor.service";
import TutorRepository from "./Repositories/TutorRepository/Tutor.repository";
import { EmailService } from "./Utils/Send.email";
import { OTPService } from "./Utils/Generate.OTP";
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
const emailService = new EmailService();
const otpService = new OTPService();
const tutorRepository = new TutorRepository()
const tutorService = new TutorService(tutorRepository,emailService,otpService)
const tutorController = new TutorController(tutorService) 

server.addService(tutorProto.TutorService.service, {
    Register: tutorController.signup.bind(tutorController),
    Login: tutorController.tutorLogin.bind(tutorController),
    VerifyOTP: tutorController.verifyOtp.bind(tutorController),
    ResendOTP: tutorController.resendOtp.bind(tutorController),
    isBlocked: tutorController.isBlocked.bind(tutorController),
    UploadPDF: tutorController.uploadPDF.bind(tutorController),
    GoogleAuth: tutorController.googleAuth.bind(tutorController),
    UploadImage: tutorController.uploadImage.bind(tutorController),
    ToggleBlock: tutorController.blockUnblock.bind(tutorController),
    FetchTutorData: tutorController.fetchTutors.bind(tutorController),
    ResetPassword: tutorController.resetPassword.bind(tutorController),
    SendOtpToEmail: tutorController.sendOtpToEmail .bind(tutorController),
    AddCourseToTutor: tutorController.addCourseToTutor.bind(tutorController),
    ResendOtpToEmail: tutorController.resendOtpToEmail.bind(tutorController),
    FetchTutorStudents: tutorController.fetchStudentIds.bind(tutorController),
    FetchTutorDetails: tutorController.fetchTutorDetails.bind(tutorController),
    UpdateTutorDetails: tutorController.updateTutorDetails.bind(tutorController),
    VerifyOTPResetPassword : tutorController.VerifyEnteredOTP.bind(tutorController),
    RegistrationDetails: tutorController.updateRegistrationDetails.bind(tutorController),
})

grpcServer() 
connectDB() 

// Start Kafka consumer
tutorController.start()
  .catch(error => console.error('Failed to start kafka course service:', error));

const PORT = configs.PORT; 
app.listen(PORT, () => {
  console.log(`Course service running on port ${PORT}`);
});
 
 