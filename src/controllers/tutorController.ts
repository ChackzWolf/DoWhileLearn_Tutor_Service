
// TutorController.ts
import { TutorService } from "../useCase/Tutor.UseCase";
import * as grpc from '@grpc/grpc-js';
import { ITutorController } from "../interfaces/ITutro.controllers";

const tutorService = new TutorService();

export class TutorController implements ITutorController {
    async signup(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
        try {
            const tutorData = call.request;
            const response = await tutorService.tutorRegister(tutorData);
            if (response.success) {
                callback(null, { success: true, msg: "OTP sent", tempId: response.tempId, email: response.email });
            } else {
                callback(null, { success: false, msg: "Email already exists." });
            }
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async verifyOtp(call: any, callback: any) {
        try{
            const data = call.request;
            const response = await tutorService.VerifyOtp(data);
            callback(null, response);
        }catch(err){
            console.error(err)
        }
    }

    async resendOtp(call:any, callback:any) {
        try{
            const data = call.request;
            const response = await tutorService.ResendOTP(data);
            callback(null,response);
        }catch(err){
            callback(err) 
        }
    } 
 
    async tutorLogin(call:any, callback:any){
        try{
            const data = call.request;
            const response = await tutorService.tutorLogin(data);
            callback(null, response);
        }catch(err){
            callback(err)

        }
    }

    async resendOtp(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.ResendOTP(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async tutorLogin(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.tutorLogin(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async blockUnblock(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
        try {
            const tutorId = call.request;
            const response = await tutorService.blockUnblock(tutorId);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async fetchTutors(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
        try {
            const response = await tutorService.fetchTutors();
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }
}
