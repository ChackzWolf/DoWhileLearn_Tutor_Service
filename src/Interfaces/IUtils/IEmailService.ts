export interface IEmailService {  
  sendVerificationMail(email: string, otp: string): Promise<void>
}