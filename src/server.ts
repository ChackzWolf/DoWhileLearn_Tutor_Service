import dotenv from "dotenv";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { TutorController }  from "./controllers/tutorController";
import { connectDB } from "./configs/mongoDB";

connectDB()
dotenv.config()

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
<<<<<<< HEAD
    TutorLogin: controller.tutorLogin
=======
    Login: controller.tutorLogin,
    FetchTutorData: controller.fetchTutors,
    ToggleBlock: controller.blockUnblock
>>>>>>> 223ee95 (added Iinterface files changed file names)
})

grpcServer()