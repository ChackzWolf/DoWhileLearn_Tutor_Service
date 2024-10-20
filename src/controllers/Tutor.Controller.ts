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
            AddStudentResponseDTO ,
            ImageRequest,
            ImageResponse,
            PDFRequest,
            PDFResponse
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
            console.log(response)
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

    async resetPassword(call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void> {
        try{
            console.log('trig respassword controller')
            const data = call.request;
            const response = await tutorService.resetPassword(data)
            callback(null, response)
        }catch(error){
            callback(error as grpc.ServiceError);
        }
    } 

    async sendOtpToEmail (call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void> {
        try {
            console.log('trig to otp email send controller ', call.request)
            const data = call.request;
            const response = await tutorService.sendEmailOtp(data);
            console.log('reseponse from controller', response);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async VerifyEnteredOTP (call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void> {
        try {
            console.log('trig', call.request);
            const data = call.request;
            const response = await tutorService.resetPasswordVerifyOTP(data);
            console.log(response,'response from controller')
            callback(null,response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async uploadImage(
        call: grpc.ServerUnaryCall<ImageRequest, ImageResponse>,
        callback: grpc.sendUnaryData<ImageResponse>
    ): Promise<void> {
        try {
            const data = call.request;
            const response = await tutorService.uploadImage(data);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async uploadPDF(
        call: grpc.ServerUnaryCall<PDFRequest, PDFResponse>,
        callback: grpc.sendUnaryData<PDFResponse>
    ): Promise<void> {
        try {
            const data = call.request;
            console.log(data, 'data form controller');
            const response = await tutorService.uploadPdf(data);
            console.log(response, 'response form controller');
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }
    async updateRegistrationDetails(call:grpc.ServerUnaryCall<any,any>,callback:grpc.sendUnaryData<any>) {
        console.log(call.request,'data');
        const data = call.request;
        try {
            const response = await tutorService.uploadPdf(data);
            console.log(response, 'response form controller');
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

}
