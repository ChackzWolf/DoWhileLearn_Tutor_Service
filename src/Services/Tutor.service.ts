import tutorRepository from "../Repositories/TutorRepository/Tutor.repository";
import { ITutor , ITempTutor } from "../Interfaces/Models/ITutor";
import  {TempTutor} from "../Schemas/Tutor.Schema";
import dotenv from "dotenv"
import { generateOTP } from "../Utils/Generate.OTP";
import { SendVerificationMail } from "../Utils/Send.email";
import createToken from "../Utils/Activation.token";
import { ITutorUseCase } from "../Interfaces/IServices/IService.interface";
import { StatusCode } from "../Interfaces/Enums/Enums";
import { uploadFile, uploadImage, uploadPDF } from "../Configs/S3.configs/S3.configs"
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
    AddRegistrationDetailsRequest
    } from '../Interfaces/DTOs/IService.dto'
dotenv.config();



const repository = new tutorRepository()
 

export class TutorService implements ITutorUseCase{
    
    async tutorRegister(tutorData: TutorSignupRequestDTO): Promise<TutorSignupResponseDTO> {
        
        try{
            console.log(`tutorService ${tutorData}`)
            const email = tutorData.email;
            if(email === undefined){
                throw new Error("Email is undefined");
            } 
            const emailExists = await repository.findByEmail(email);
            
            if(emailExists){
                console.log('email exists triggered')
                return {success: false, message: "Email already exists" };
            } 

            let otp = generateOTP();
            console.log(`OTP : [ ${otp} ]`);
            await SendVerificationMail(email,otp)
  
            console.log('Email send')

            const tempTutorData: ITempTutor | null = await repository.createTempTutor({
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
            
            const createTutor: ITutor | null = await repository.createTutor(tempTutor.tutorData);
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



    async resendOTP(passedData: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO> {
        
        try{
            const {email,tempId} = passedData;
            let newOTP = generateOTP();
            console.log(` ressend OTP : [   ${newOTP}   ]`);

            const updatedTempTutor = await TempTutor.findByIdAndUpdate(tempId,{otp:newOTP},{new:true})

            if(!updatedTempTutor){
                console.log('failed to send otp')
                return { success: false, message: "Register time has expaired. Try registering again"}
            }else{
                await SendVerificationMail(email,newOTP)

                return {success: true, message:"OTP has been resent"}; 
            } 
        }catch{
            return {success: false, message: "An error occured while Resending OTP"}
        }
    }
    
    async tutorLogin(loginData: TutorLoginRequestDTO): Promise<TutorLoginResponseDTO> {
        try {
            const {email, password} = loginData;
            const tutorData = await repository.findByEmail(email);
            if(tutorData){
                const checkPassword = await tutorData.comparePassword(password)
                if(checkPassword){
                    const tutorId = tutorData._id;
                    const isBlocked = await repository.isBlocked(tutorId)
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
            const tutors = await repository.getAllTutors();
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
            const response = await repository.blockUnblock(data.tutorId);
            console.log(response)
            if(!response.success){
                return {success:false, message:"Error finding tutor."}
            }
            return {success: true, message: response.message}

        }catch(error){
            return { success :false, message: "an error occured."}
        }
    }

    async addToSutdentList(data: AddStudentRequestDTO): Promise<AddStudentResponseDTO> {
        try {
            console.log(data)
            const response = await repository.addToSutdentList(data.userId,data.tutorId, data.tutorShare);
            console.log(response)
            if(response.success){
                return {message:response.message, success: true, status: StatusCode.Created}
            }else{
                return {message: "error creating order", success: false, status: StatusCode.NotFound}
            }
        } catch (error) {
            console.log(error)
            return {message :"Error occured while creating order", success: false , status: StatusCode.ExpectationFailed }
        }
    }

    async checkIsBlocked(data: {tutorId:string}): Promise<{isBlocked:boolean | undefined}> {
        try {
            const response = await repository.isBlocked(data.tutorId);

            return {isBlocked : response }
        } catch (error) {
            return {isBlocked:true}
        }
    }

    async resetPassword(data: {tutorId:string, password:string}){
        try {
            const {tutorId,password} = data;
            const response = await repository.passwordChange(tutorId, password);
            return response
        } catch (error) {
            return {message:'error occured in service while changing password', success:false, status: StatusCode.NotModified}
        }
    }

    async sendEmailOtp (data: {email:string}){
        try {
            const email = data.email; 
            const emailExists = await repository.findByEmail(email);
            if(!emailExists){
                console.log("email not found triggered")
                return {success: false, message: "Email not found", status:StatusCode.NotFound };
            }
            let otp = generateOTP();
            console.log(`OTP : [ ${otp} ]`);
            await SendVerificationMail(email,otp)
            console.log('1')
            await repository.storeOTP(email,otp);
            console.log('2')
            return {message: 'An OTP has send to your email address.', success:true, status: StatusCode.Found,email};
        } catch (error) {
            return {message:'error occured in sending OTP.', success:false, status: StatusCode.Conflict}
        }
    }

    async resetPasswordVerifyOTP(data: {email:string,enteredOTP:string}){
        try { 
            const {email,enteredOTP} = data;
            const response = await repository.verifyOTP(email,enteredOTP)
            const user = await repository.findByEmail(email);
            if(response && user){
                return {success:true, message: 'Email has been verified successfuly.',status:StatusCode.Accepted,email,tutorId:user._id}
            }
            return {success:false, message: 'Entered wrong OTP.', status:StatusCode.NotAcceptable,email}
        } catch (error) {
            return {success:false, message: "Something went wrong.",status:StatusCode.FailedDependency, email:data.email} 
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

    async addRegistrationDetails(data:AddRegistrationDetailsRequest){
        try {
            const response = await repository.addRegistrationDetails(data)
            return response
        } catch (error) {
            return {success:false,message:'Error occured nthan aryila.'}
        }
    }
} 