import { TutorService } from "../Services/Tutor.service";
import * as grpc from '@grpc/grpc-js';
import { ITutorController } from "../Interfaces/IControllers/IController.interface";
import { 
            TutorSignupRequestDTO, 
            TutorSignupResponseDTO, 
            TutorVerifyOtpRequestDTO, 
            TutorVerifyOtpResponseDTO, 
            TutorResendOtpRequestDTO, 
            TutorResendOtpResponseDTO, 
            TutorLoginRequestDTO, 
            TutorLoginResponseDTO, 
            BlockUnblockRequestDTO, 
            BlockUnblockResponseDTO, 
            FetchTutorsResponseDTO, 
            AddStudentRequestDTO, 
            AddStudentResponseDTO 
        } from '../Interfaces/DTOs/IController.dto'; 

const tutorService = new TutorService();

export class TutorController implements ITutorController {
    async signup(call: grpc.ServerUnaryCall<TutorSignupRequestDTO, TutorSignupResponseDTO>, callback: grpc.sendUnaryData<TutorSignupResponseDTO>): Promise<void> {
        try {
            const tutorData = call.request;
            const response = await tutorService.tutorRegister(tutorData);
            callback(null, { success: response.success, msg: response.message, tempId: response.tempId, email: response.email });
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async verifyOtp(call: grpc.ServerUnaryCall<TutorVerifyOtpRequestDTO, TutorVerifyOtpResponseDTO>, callback: grpc.sendUnaryData<TutorVerifyOtpResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.verifyOtp(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async resendOtp(call: grpc.ServerUnaryCall<TutorResendOtpRequestDTO, TutorResendOtpResponseDTO>, callback: grpc.sendUnaryData<TutorResendOtpResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.resendOTP(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async tutorLogin(call: grpc.ServerUnaryCall<TutorLoginRequestDTO, TutorLoginResponseDTO>, callback: grpc.sendUnaryData<TutorLoginResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.tutorLogin(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async blockUnblock(call: grpc.ServerUnaryCall<BlockUnblockRequestDTO, BlockUnblockResponseDTO>, callback: grpc.sendUnaryData<BlockUnblockResponseDTO>): Promise<void> {
        try {
            const tutorId = call.request;
            const response = await tutorService.blockUnblock(tutorId);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async fetchTutors(_call: grpc.ServerUnaryCall<any, FetchTutorsResponseDTO>, callback: grpc.sendUnaryData<FetchTutorsResponseDTO>): Promise<void> {
        try {
            const response = await tutorService.fetchTutors();
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async addStudent(call: grpc.ServerUnaryCall<AddStudentRequestDTO, AddStudentResponseDTO>, callback: grpc.sendUnaryData<AddStudentResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.addToSutdentList(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }


    async isBlocked(call:grpc.ServerUnaryCall<any, any>, callback:grpc.sendUnaryData<any>):Promise<void> {
        try {
            console.log('isBlocked trig');
            const data = call.request
            console.log(data);
            const response = await tutorService.checkIsBlocked(data);
            console.log(response, 'response from controller')
            callback(null,{isBlocked:response.isBlocked})
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }
}
