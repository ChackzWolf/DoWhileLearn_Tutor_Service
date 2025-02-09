import tutorRepository from "../Repositories/TutorRepository/Tutor.repository";
import { ITutor , ITempTutor } from "../Interfaces/Models/ITutor";
import  {TempTutor} from "../Schemas/Tutor.Schema";
import dotenv from "dotenv"
import createToken from "../Utils/Activation.token";
import ITutorService from "../Interfaces/IServices/IService.interface";
import { StatusCode } from "../Interfaces/Enums/Enums";
import { uploadImage, uploadPDF } from "../Configs/S3.configs/S3.configs"
import {UploadImageDTO,
    UploadImageResponseDTO,
    TutorLoginRequestDTO,
    VerifyOtpRequestDTO,
    ResendOtpRequestDTO,
    TutorLoginResponseDTO,
    FetchTutorsResponseDTO,
    BlockUnblockResponseDTO,
    AddStudentRequestDTO,
    AddStudentResponseDTO,
    TutorSignupRequestDTO,
    TutorSignupResponseDTO,
    VerifyOtpResponseDTO,
    ResendOtpResponseDTO,
    BlockUnblockRequestDTO,
    UploadPdfDTO,
    UploadPdfResponseDTO,
    AddRegistrationDetailsRequest,
    GoogleAuthRequestDTO,
    GoogleAuthResponseDTO
    } from '../Interfaces/DTOs/IService.dto'
dotenv.config();
import {kafkaConfig} from "../Configs/Kafka.configs/Kafka.config"
import {ObjectId} from "mongodb"
import { ITutorRepository } from "../Interfaces/IRepositories/IRepository.interface";
import { IEmailService } from "../Interfaces/IUtils/IEmailService";
import { IOTPService } from "../Interfaces/IUtils/IOTPService";
import { kafka_Const } from "../Configs/Kafka.configs/Topic.config";



const repository = new tutorRepository()
 

export class TutorService implements ITutorService{

    private tutorRepository : ITutorRepository;
    private emailService: IEmailService;
    private otpService: IOTPService;

    constructor(tutorRepository: ITutorRepository, emailService: IEmailService, otpService: IOTPService) {
        this.tutorRepository = tutorRepository;
        this.emailService = emailService;
        this.otpService = otpService;
    }


    async googleAuthentication(data: GoogleAuthRequestDTO): Promise<GoogleAuthResponseDTO>{
        try {
            const {email, firstName, lastName, photoUrl} = data;
        console.log(data, ' dtaa from service')
            const tutorData = await this.tutorRepository.findByEmail(email);
            if(tutorData){
                if(!tutorData.profilePicture) {
                    const added = await this.tutorRepository.udpateTutorProfilePicture(tutorData._id,photoUrl);
                    console.log(added,'updated profile pic')
                    const {refreshToken, accessToken} = createToken(tutorData, "TUTOR")
                    return {success:true, message: "Tutor login successful.", tutorData, refreshToken, accessToken, tutorId:tutorData._id, type:"SIGN_IN"}
                }
                const tutorId = tutorData._id;
                const isBlocked = await this.tutorRepository.isBlocked(tutorId)
                if(isBlocked){
                    return {success: false, message:'isBlocked', type:"SIGN_IN"} 
                }
                console.log(tutorData,'kkkkkkkkk') 
                const _id = tutorData._id;
                const {refreshToken, accessToken} = createToken(tutorData, "TUTOR")

                return {success:true, message: "Tutor login successful.", tutorData, refreshToken, accessToken, tutorId:_id, type:"SIGN_IN"}
            }else{
                const data = {
                    email,
                    firstName,
                    lastName,
                    password:"Jacks@123",
                    profilePicture:photoUrl,
                }
                const createTutor: ITutor | null = await this.tutorRepository.createTutor(data);
                if(createTutor){
                    const {accessToken, refreshToken} = createToken(createTutor,'TUTOR');
                    return { success: true, message: "Tutor has been registered.", tutorData: createTutor, accessToken, refreshToken, tutorId:createTutor?._id, type:"SIGN_UP"};
                }else{
                    throw new Error("Failed to create tutor.");
                }
            }
        } catch (error) {
            throw new Error(`Authentication failed: ${error}`);

        }
    }
    
    async tutorRegister(tutorData: TutorSignupRequestDTO): Promise<TutorSignupResponseDTO> {
        
        try{
            console.log(`tutorService ${tutorData}`)
            const email = tutorData.email;
            if(email === undefined){
                throw new Error("Email is undefined");
            } 
            const emailExists = await this.tutorRepository.findByEmail(email);
            
            if(emailExists){
                console.log('email exists triggered')
                return {success: false, message: "Email already exists" };
            } 

            let otp = this.otpService.generateOTP();
            console.log(`OTP : [ ${otp} ]`);
            await this.emailService.sendVerificationMail(email,otp)
  
            console.log('Email send')

            const tempTutorData: ITempTutor | null = await this.tutorRepository.createTempTutor({
                otp,
                tutorData: tutorData as ITutor, 
            });    

            if (tempTutorData) {  
                const tempId = tempTutorData._id.toString(); // Convert ObjectId to string if needed
                return { success: true, message: "Verification email sent", tempId, email};
            } else {
                throw new Error("Failed to create temporary tutor data.");
            }
        }catch(err){
            throw new Error(`Failed to signup: ${err}`);
        } 
    }



    async verifyOtp(passedData: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO> {
        try {
            console.log('ive vannarnu', passedData);
            const tempTutor: ITempTutor | null = await TempTutor.findById(passedData.tempId);
            
            if (!tempTutor) {
                return { success: false, message: "Temp tutor not found." };
            }
    
            if (tempTutor.otp !== passedData.enteredOTP) {
                return { success: false, message: "Invalid OTP." };
            }
            
            const createTutor: ITutor | null = await this.tutorRepository.createTutor(tempTutor.tutorData);
            const _id = createTutor?._id;
    
            if (!createTutor) {
                throw new Error("Failed to create tutor.");
            }
    
            console.log( createTutor, 'create tutorrr')
            const {accessToken, refreshToken} = createToken(createTutor,'TUTOR');
            return { success: true, message: "Tutor has been registered.", tutorData: createTutor, accessToken, refreshToken, tutorId:_id };
    
        } catch (err) { 
            console.error("Error in VerifyOtp:", err);
            return { success: false, message: "An error occurred while verifying OTP." };
        }
    }

    async addCourseToTutor(data:{tutorId:string,courseId:string}):Promise<{success:boolean, status:number}>{
        try {
            const {tutorId,courseId} = data;
            const response = this.tutorRepository.addCourseToTutor(tutorId,courseId);
            return response;
        } catch (error) {
            throw new Error(`error occured while update course to tutor ${error}`)
        }
    }





    async resendOTP(passedData: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO> {
        
        try{
            const {email,tempId} = passedData;
            let newOTP = this.otpService.generateOTP();
            console.log(` ressend OTP : [   ${newOTP}   ]`);
            
            const updatedTempTutor = await TempTutor.findByIdAndUpdate(tempId,{otp:newOTP},{new:true})
            
            if(!updatedTempTutor){
                console.log('failed to send otp')
                return { success: false, message: "Register time has expaired. Try registering again"}
            }else{
                await this.emailService.sendVerificationMail(email,newOTP)
            
                return {success: true, message:"OTP has been resent"}; 
            } 
        }catch{
            return {success: false, message: "An error occured while Resending OTP"}
        }
    }
    
    async tutorLogin(loginData: TutorLoginRequestDTO): Promise<TutorLoginResponseDTO> {
        try {
            const {email, password} = loginData;
            const tutorData = await this.tutorRepository.findByEmail(email);
            if(tutorData){
                const checkPassword = await tutorData.comparePassword(password)
                if(checkPassword){
                    const tutorId = tutorData._id;
                    const isBlocked = await this.tutorRepository.isBlocked(tutorId)
                    if(isBlocked){
                        return {success: false, message : 'isBlocked'} 
                    }
                    console.log(tutorData,'kkkkkkkkk') 
                    const _id = tutorData._id;
                    const {refreshToken, accessToken} = createToken(tutorData, "TUTOR")

                    return {success:true, message: "Tutor login successful.", tutorData, refreshToken, accessToken, _id}
                }else {
                    return { success: false, message: "Invalid password."}
                } 
            }else{
                return {success: false , message: "Invalid email."}
            }  
            
        } catch (error) {
            return { success:false, message: "An error occured while loggin in."};
        }
    }

    async fetchTutors(): Promise<FetchTutorsResponseDTO> {
        
        try {
            const tutors = await this.tutorRepository.getAllTutors();
            console.log(tutors, 'students')
            if (tutors) {
                return { success: true, tutors };
            } else {
                return { success: false };
            }
        } catch (err) {
            return { success: false };
        }
    }
    
    async blockUnblock(data: BlockUnblockRequestDTO): Promise<BlockUnblockResponseDTO> {
        try{
            console.log(data.tutorId,'from use case')
            const response = await this.tutorRepository.blockUnblock(data.tutorId);
            console.log(response)
            if(!response.success){
                return {success:false, message:"Error finding tutor."}
            }
            return {success: true, message: response.message}

        }catch(error){
            return { success :false, message: "an error occured."}
        }
    }

    async handleCoursePurchase(paymentEvent: AddStudentRequestDTO): Promise<void> {
        try {
            console.log(paymentEvent)
            const { tutorId, courseId, userId, tutorShare} = paymentEvent;
            const moneyToAdd = parseInt(tutorShare);
            const updateStudentList = await this.tutorRepository.addToSutdentList(tutorId, courseId, userId);
            if(updateStudentList.message !== 'Exists'){
                await this.tutorRepository.updateWallet(tutorId, moneyToAdd);
            }

            if(updateStudentList.success){
                await kafkaConfig.sendMessage(kafka_Const.topics.TUTOR_RESPONSE, {
                    success: true,
                    service: 'tutor-service',
                    status: 'COMPLETED',
                    transactionId: paymentEvent.transactionId
                  });
            }else{
                console.error('Error handle course purchase')
                throw Error
            }
        } catch (error:any) {
            console.error('Order creation failed:', error);
            await kafkaConfig.sendMessage(kafka_Const.topics.TUTOR_RESPONSE, {
                ...paymentEvent,
                service: 'tutor-service',
                status: 'FAILED',
                error: error.message
              });  
        } 
    }

    async handleOrderTransactionFail(failedTransactionEvent:AddStudentRequestDTO): Promise<void>{
        console.log(failedTransactionEvent)
        const { tutorId, courseId, userId, tutorShare} = failedTransactionEvent;
        const moneyToDeduct = parseInt(tutorShare);
        const updateStudentList = await this.tutorRepository.removeFromStudentList(tutorId, courseId, userId);
        const updateWallet = await this.tutorRepository.updateWallet(tutorId, moneyToDeduct*-1);
        if(updateStudentList.success && updateWallet.success){
            await kafkaConfig.sendMessage(kafka_Const.topics.TUTOR_ROLLBACK_COMPLETED, { 
                transactionId: failedTransactionEvent.transactionId,
                service: 'tutor-service'
              });
        }else{
            console.error('rollback failed course purchase')
            throw Error
        }
      }

    async checkIsBlocked(data: {tutorId:string}): Promise<{isBlocked:boolean | undefined}> {
        try {
            const response = await this.tutorRepository.isBlocked(data.tutorId);

            return {isBlocked : response }
        } catch (error) {
            return {isBlocked:true}
        }
    }

    async resetPassword(data: {tutorId:string, password:string}):Promise<{message:string,success:boolean,status:number}>{
        try {
            const {tutorId,password} = data;
            const response = await this.tutorRepository.passwordChange(tutorId, password);
            return response
        } catch (error) {
            return {message:'error occured in service while changing password', success:false, status: StatusCode.NotModified}
        }
    }

    async sendEmailOtp (data: {email:string}):Promise<{message:string,success:boolean, status:number, email?:string,otpId?: ObjectId ,tutorId?:string}>{
        try {
            const email = data.email; 
            const emailExists = await this.tutorRepository.findByEmail(email);
            if(!emailExists){
                console.log("email not found triggered")
                return {success: false, message: "Email not found", status:StatusCode.NotFound };
            }
            let otp = this.otpService.generateOTP();
            console.log(`OTP : [ ${otp} ]`);
            await this.emailService.sendVerificationMail(email,otp)
            console.log('1')
            const otpId = await this.tutorRepository.storeOTP(email,otp);
            console.log('2')
            return {message: 'An OTP has send to your email address.', success:true, status: StatusCode.Found,email,otpId, tutorId:emailExists._id};
        } catch (error) {
            return {message:'error occured in sending OTP.', success:false, status: StatusCode.Conflict}
        }
    }



    async resetPasswordVerifyOTP(data: {email:string,enteredOTP:string}): Promise <{success:boolean, message:string,status:number,email:string,tutorId?:string}>{
        try { 
            const {email,enteredOTP} = data;
            const response = await this.tutorRepository.verifyOTP(email,enteredOTP)
            const user = await this.tutorRepository.findByEmail(email);
            if(response && user){
                return {success:true, message: 'Email has been verified successfuly.',status:StatusCode.Accepted,email,tutorId:user._id}
            }
            return {success:false, message: 'Entered wrong OTP.', status:StatusCode.NotAcceptable,email}
        } catch (error) {
            return {success:false, message: "Something went wrong.",status:StatusCode.FailedDependency, email:data.email} 
        }
    }

    async resendEmailOtp (data: {email: string,otpId:string}): Promise<{success:boolean, status:number, message:string}>{
        try {
            console.log('trig resend')
            const {email, otpId} = data;
            let otp = this.otpService.generateOTP();
            console.log(`OTP : [ ${otp} ]`);
            await this.emailService.sendVerificationMail(email,otp) 
            const updateStoredOTP = await this.tutorRepository.updateStoredOTP(otpId,otp);
            if(!updateStoredOTP){
                return {success:false, status: StatusCode.NotFound, message:"Time expired. try again later."}
            }
            return {success:true,status : StatusCode.Accepted, message : "OTP has resend"};
        } catch (error) {
            console.log(error, "error")
            return {success:false, status: StatusCode.Conflict, message: "Error occured while resending OTPddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd."};
        }
    }

    async uploadImage(data: UploadImageDTO): Promise<UploadImageResponseDTO> {
        try {
            const response = await uploadImage(data.imageBinary, data.imageName)
            return { message: "Image uploaded successfully.", s3Url: response.publicUrl, success: true };
        } catch (error) {
            if (error instanceof Error) {
                console.error('File upload failed:', error.message);
                return { success: false, message: `File upload failed: ${error.message}` };
            } else {
                console.error('An unknown error occurred:', error);
                return { success: false, message: 'File upload failed: Unknown error' };
            }
        }
    }

    async uploadPdf(data: UploadPdfDTO): Promise<UploadPdfResponseDTO> {
        try {
            const response = await uploadPDF(data.pdfBinary, data.pdfName)
            return { message: "Image uploaded successfully.", s3Url: response.publicUrl, success: true };
        } catch (error) {
            if (error instanceof Error) {
                console.error('File upload failed:', error.message);
                return { success: false, message: `File upload failed: ${error.message}` };
            } else {
                console.error('An unknown error occurred:', error);
                return { success: false, message: 'File upload failed: Unknown error' };
            }
        }
    }

    async addRegistrationDetails(data:AddRegistrationDetailsRequest):Promise<{success:boolean, message:string, tutorData?:ITutor}> {
        try {
            const response = await this.tutorRepository.addRegistrationDetails(data)
            return response
        } catch (error) {
            return {success:false,message:'Error occured nthan aryila.'}
        }
    }

    async fetchTutorDetails(data:{tutorId:string}):Promise<{success:boolean, status:number,tutorData?:ITutor}>{
        try {
            const tutorId = data.tutorId;
            console.log('fetch tutoro details from service ', tutorId)
            const response = await this.tutorRepository.getTutorDetails(tutorId);
            
            return response
        } catch (error) {
            return {success:false, status:StatusCode.Conflict}
        }
    }

    async updateTutorDetails(data:{formData:ITutor}):Promise <{success:boolean, status:number, message:string}>{
        try {
            const datatoUpdate = data.formData;
            const response = await this.tutorRepository.updateTutor(datatoUpdate);
            console.log(response);
            if(!response){
                return {success:false, status:StatusCode.Conflict, message:"No response. Error occured while updating tutor details."}
            }
            return {success: true, status:StatusCode.Accepted, message: "Tutor details updated successfuly."}
        } catch (error) {
            return {success:false, status:StatusCode.Conflict, message:"Error occured while updating tutor details."}
        }
    }

    async fetchAllStudentIds( data: {tutorId:string}):Promise<{success:boolean, message:string, studentIds?:string[]}>{
        try {
            const tutorId = data.tutorId;
            const response = await this.tutorRepository.getAllStudentIds(tutorId);
            return response;
        } catch (error) {
            return {success:false , message:"Error occured while fetching student ids."}
        }
    }
} 