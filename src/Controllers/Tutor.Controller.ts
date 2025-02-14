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
            PDFResponse,
            GoogleAuthRequestDTO,
            GoogleAuthResponseDTO
        } from '../Interfaces/DTOs/IController.dto'; 
import { kafkaConfig } from "../Configs/Kafka.configs/Kafka.config";
import { KafkaMessage } from "kafkajs";
import ITutorService from "../Interfaces/IServices/IService.interface";
import { kafka_Const } from "../Configs/Kafka.configs/Topic.config";
export interface OrderEventData {
    userId: string;
    tutorId: string;
    courseId: string;
    transactionId: string;
    title: string;
    thumbnail: string;
    price: string;
    adminShare: string; 
    tutorShare: string;
    paymentStatus:boolean;
    timestamp: Date;
    status: string;
  }



export class TutorController implements ITutorController {

    private tutorService : ITutorService

    constructor(tutorService:ITutorService) {
        this.tutorService = tutorService;
    }

    async start(): Promise<void> {
        const topics =          [
          kafka_Const.topics.TUTOR_UPDATE,
          kafka_Const.topics.TUTOR_ROLLBACK
        ]

        await kafkaConfig.consumeMessages(
          kafka_Const.TUTOR_SERVICE_GROUP_NAME,
          topics,
          this.routeMessage.bind(this)
        );
      }


        
      async routeMessage(topics:string[], message:KafkaMessage, topic:string):Promise<void>{
        try {
          switch (topic) {
            case kafka_Const.topics.TUTOR_UPDATE:
                await this.handleMessage(message);
                break;
            case kafka_Const.topics.TUTOR_ROLLBACK:
                await this.handleRollback(message); 
                break;
            default:
                console.warn(`Unhandled topic: ${topic}`);

        }
        } catch (error) { 
          
        } 
      }

    async handleMessage(message: KafkaMessage): Promise<void>  {
        try {
            const orderDetails: OrderEventData = JSON.parse(message.value?.toString() || '');
            console.log(orderDetails, 'purchase has been triggered')
            await this.tutorService.handleCoursePurchase(orderDetails);
        } catch (err) {
            throw new Error("Error from controller.");
        }
    }
    
    async handleRollback(message: KafkaMessage): Promise<void>  {
        try {
            const orderDetails: OrderEventData = JSON.parse(message.value?.toString() || '');
            console.log(orderDetails, 'Rollback has been triggered.')
            await this.tutorService.handleOrderTransactionFail(orderDetails);
        } catch (err) {
            throw Error;
        }
    }
    
    async googleAuth(call:grpc.ServerUnaryCall<GoogleAuthRequestDTO, GoogleAuthResponseDTO>, callback: grpc.sendUnaryData<GoogleAuthResponseDTO>):Promise<void>{
        try {
            const data = call.request;
            const response = await this.tutorService.googleAuthentication(data);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async signup(call: grpc.ServerUnaryCall<TutorSignupRequestDTO, TutorSignupResponseDTO>, callback: grpc.sendUnaryData<TutorSignupResponseDTO>): Promise<void> {
        try {
            const tutorData = call.request;
            const response = await this.tutorService.tutorRegister(tutorData);
            callback(null, { success: response.success, msg: response.message, tempId: response.tempId, email: response.email });
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async verifyOtp(call: grpc.ServerUnaryCall<TutorVerifyOtpRequestDTO, TutorVerifyOtpResponseDTO>, callback: grpc.sendUnaryData<TutorVerifyOtpResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await this.tutorService.verifyOtp(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async resendOtp(call: grpc.ServerUnaryCall<TutorResendOtpRequestDTO, TutorResendOtpResponseDTO>, callback: grpc.sendUnaryData<TutorResendOtpResponseDTO>): Promise<void> {
        try {
            const data = call.request;
            const response = await this.tutorService.resendOTP(data);
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }

    async tutorLogin(call: grpc.ServerUnaryCall<TutorLoginRequestDTO, TutorLoginResponseDTO>, callback: grpc.sendUnaryData<TutorLoginResponseDTO>): Promise<void> {
        try { 
            const data = call.request;
            const response = await this.tutorService.tutorLogin(data);
            console.log(response)
            callback(null, response);
        } catch (err) {
            callback(err as grpc.ServiceError);
        }
    }  

    async addCourseToTutor (call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>):Promise<void>{
        try {
            console.log('add course to tutor triggered !',call.request);
            const data = call.request;
            const response = await this.tutorService.addCourseToTutor(data);
            console.log(response,'response form tutor !');
            callback(null, response)
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    } 

    async blockUnblock(call: grpc.ServerUnaryCall<BlockUnblockRequestDTO, BlockUnblockResponseDTO>, callback: grpc.sendUnaryData<BlockUnblockResponseDTO>): Promise<void> {
        try {
            const tutorId = call.request;
            const response = await this.tutorService.blockUnblock(tutorId);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async fetchTutors(_call: grpc.ServerUnaryCall<any, FetchTutorsResponseDTO>, callback: grpc.sendUnaryData<FetchTutorsResponseDTO>): Promise<void> {
        try {
            const response = await this.tutorService.fetchTutors();
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
            const response = await this.tutorService.checkIsBlocked(data);
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
            const response = await this.tutorService.resetPassword(data)
            callback(null, response)
        }catch(error){
            callback(error as grpc.ServiceError);
        }
    } 

    async sendOtpToEmail (call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void> {
        try {
            console.log('trig to otp email send controller ', call.request)
            const data = call.request;
            const response = await this.tutorService.sendEmailOtp(data);
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
            const response = await this.tutorService.resetPasswordVerifyOTP(data);
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
            const response = await this.tutorService.uploadImage(data);
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
            const response = await this.tutorService.uploadPdf(data);
            console.log(response, 'response form controller');
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }
    async updateRegistrationDetails(call:grpc.ServerUnaryCall<any,any>,callback:grpc.sendUnaryData<any>) {
        console.log(call.request,'data from controller');
        const data = call.request;
        try {
            const response = await this.tutorService.addRegistrationDetails(data);
            console.log(response, 'response form controller');
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError);
        }
    }

    async resendOtpToEmail(call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void> {
        try {
            console.log('trig to resend otp email send controller ', call.request);
            const data = call.request;
            const response = await this.tutorService.resendEmailOtp(data);
            console.log('resend otp reseponse from controller', response);
            callback(null, response);
        } catch (error) {
            callback(error as grpc.ServiceError); 
        } 
    }
 
    async fetchTutorDetails(call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void>{
        try {
            console.log('triggerd fetching tutor details.');
            const data = call.request;
            const response = await this.tutorService.fetchTutorDetails(data);
            console.log('response from controller', response);
            callback(null, response);
        } catch (error) {
            throw new Error ("error from controller")
        } 
    }  

    async updateTutorDetails(call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>): Promise<void>{
        try {
            console.log('triggered tutor details update.', call.request)
            const data = call.request;
            const response = await this.tutorService.updateTutorDetails(data);
            console.log(response, "response from controller.");
            callback(null, response);
        } catch (error) {
            throw new Error ("error from controller fetching tutor details")
        } 
    }

    async fetchStudentIds (call: grpc.ServerUnaryCall<any,any>, callback:grpc.sendUnaryData<any>):Promise <void> {
        try {
            console.log('triggerd fetch studentsIds ' , call.request);
            const data = call.request;
            const response = await this.tutorService.fetchAllStudentIds(data);
            console.log(response, ' student ids');
            callback(null, response);
        } catch (error) {
            throw new Error ("error from controller fetching studentIds")
        }
    }
 
}
 