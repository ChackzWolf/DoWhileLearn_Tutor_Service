import { TutorService } from "../services/TutorService";


const tutorService = new TutorService()


export class TutorController {

    async signup(call: any, callback: any) {
        try {
            const tutorData = call.request;
            const response = await tutorService.tutorRegister( tutorData);
            if(response.success) {
                callback( null , { success: true, msg: "OTP sent", tempId: response.tempId, email: response.email});
            }else{
                callback(null, {success: false, msg: "Email already exists."})
            }
        } catch (err) {
            callback(err)
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
}