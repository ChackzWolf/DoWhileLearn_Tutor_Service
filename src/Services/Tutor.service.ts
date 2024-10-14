import tutorRepository from "../Repositories/TutorRepository/Tutor.repository";
import { ITutor , ITempTutor } from "../Interfaces/Models/ITutor";
import  {TempTutor} from "../Schemas/Tutor.Schema";
import dotenv from "dotenv"
import { generateOTP } from "../Utils/Generate.OTP";
import { SendVerificationMail } from "../Utils/Send.email";
import createToken from "../Utils/Activation.token";
import { ITutorUseCase } from "../Interfaces/IServices/IService.interface";
import { StatusCode } from "../Interfaces/Enums/Enums";
import {
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
    BlockUnblockRequestDTO
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
            return { success: true, message: "Tutor has been registered.", tutorData: createTutor, accessToken, refreshToken, _id };
    
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
} 