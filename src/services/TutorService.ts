import tutorRepository from "../repository/tutorRepository";
import  {ITutor, ITempTutor, TempTutor} from "../models/tutorModel";
import dotenv from "dotenv"
import { generateOTP } from "../utils/generateOTP";
import { SendVerificationMail } from "../utils/sendEmail";
import createToken from "../utils/activationToken";
import { ITutorService } from "../interfaces/ITutorService";
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
 

export class TutorService implements ITutorService{
    
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

    async VerifyOtp(passedData: VerifyOtpData): Promise<{success:boolean, message:string, token?:string, refreshToken? :string}>{
        try {
            const tempTutor: ITempTutor | null = await TempTutor.findById(passedData.tempId);
            
            if (!tempTutor) {
                return { success: false, message: "Temp tutor not found." };
            }
    
            if (tempTutor.otp !== passedData.enteredOTP) {
                return { success: false, message: "Invalid OTP." };
            }
    
            const createTutor: ITutor | null = await repository.createTutor(tempTutor.tutorData);
    
            if (!createTutor) {
                throw new Error("Failed to create tutor.");
            }
    
            const {accessToken, refreshToken} = createToken(createTutor);

            console.log(refreshToken)
            return { success: true, message: "Tutor has been registered.", token:accessToken, refreshToken };
    
        } catch (err) {
            console.error("Error in VerifyOtp:", err);
            return { success: false, message: "An error occurred while verifying OTP." };
        }
    }



    async ResendOTP(passedData : VerifyOtpData):Promise<{success: boolean, msg:string}> {
        try{
            const {email,tempId} = passedData;
            let newOTP = generateOTP();
            console.log(`OTP : [   ${newOTP}   ]`);

            const updatedTempTutor = await TempTutor.findByIdAndUpdate(tempId,{otp:newOTP},{new:true})

            if(!updatedTempTutor){
                console.log('failed to send otp')
                return { success: false, msg: "Register time has expaired. Try registering again"}
            }else{
                await SendVerificationMail(email,newOTP)

                return {success: true, msg:"OTP has been resent"};
            } 
        }catch{
            return {success: false, msg: "An error occured while Resending OTP"}
        }
    }
    
    async tutorLogin(loginData: { email: string; password: string; }): Promise<{ success: boolean; msg: string; token?: string , refreshToken?:string }> {
        try {
            const {email, password} = loginData;
            const tutorData = await repository.findByEmail(email);
            if(tutorData){
                const checkPassword = await tutorData.comparePassword(password)
                if(checkPassword){
                    const {accessToken,refreshToken} = createToken(tutorData);
                    console.log(refreshToken)
                    
                    return {success:true, msg: "Tutor login successful.", token :accessToken, refreshToken}
                }else {
                    return { success: false, msg: "Invalid password."}
                }
            }else{
                return {success: false , msg: "Invalid email."}
            }
            
        } catch (error) {
            return { success:false, msg: "An error occured while loggin in."};
        }
    }
    
} 