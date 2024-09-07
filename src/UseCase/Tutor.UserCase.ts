import tutorRepository from "../repository/Tutor.repository";
import  {ITutor, ITempTutor, TempTutor} from "../models/Tutor.model";
import dotenv from "dotenv"
import { generateOTP } from "../utils/Generate.OTP";
import { SendVerificationMail } from "../utils/Send.email";
import createToken from "../utils/Activation.token";
import { ITutorUseCase } from "../interfaces/ITutor.Use.case";
dotenv.config();

interface Tutor{
    firstName:string;
    lastName: string; 
    email: string;
    password: string;
}

interface VerifyOtpData{
    enteredOTP:string;
    email:string;
    tempId:string
}



const repository = new tutorRepository()

interface promiseReturn { success: boolean, message: string, tempId?: string, email?: string }
 

export class TutorService implements ITutorUseCase{
    
    async tutorRegister(tutorData: Tutor): Promise <promiseReturn> {
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
    

    async VerifyOtp(passedData: VerifyOtpData): Promise<{success:boolean, message:string, tutorData?:ITutor, accessToken?:string, refreshToken?:string , _id?:string}>{
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



    async ResendOTP(passedData : VerifyOtpData):Promise<{success: boolean, message:string}> {
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
    
    async tutorLogin(loginData: { email: string; password: string; }): Promise<{ success: boolean; message: string; tutorData?: ITutor ,accessToken?:string, refreshToken?:string , _id?:string}> {
        try {
            const {email, password} = loginData;
            const tutorData = await repository.findByEmail(email);
            if(tutorData){
                const checkPassword = await tutorData.comparePassword(password)
                if(checkPassword){
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

    async fetchTutors(): Promise<{ success: boolean; tutors?: ITutor[] }> {
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
    

    async blockUnblock(data:{tutorId:string}): Promise<{success:boolean; message?:string}> {
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


    
} 