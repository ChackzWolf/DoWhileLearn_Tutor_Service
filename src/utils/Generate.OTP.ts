import { IOTPService } from "../Interfaces/IUtils/IOTPService";

export class OTPService implements IOTPService {
    generateOTP(): string {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        return otp;
    };  
}