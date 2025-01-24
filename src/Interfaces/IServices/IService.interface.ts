import {ObjectId} from "mongodb"
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
        BlockUnblockRequestDTO,
        UploadImageDTO,
        UploadImageResponseDTO,
        UploadPdfDTO,
        UploadPdfResponseDTO,
        AddRegistrationDetailsRequest,
        GoogleAuthRequestDTO,
        GoogleAuthResponseDTO
        } from '../DTOs/IService.dto'
import { ITutor } from "../Models/ITutor";

export default interface ITutorService {
  googleAuthentication(data: GoogleAuthRequestDTO): Promise<GoogleAuthResponseDTO>
  tutorRegister(tutorData: TutorSignupRequestDTO): Promise <TutorSignupResponseDTO>;
  verifyOtp(passedData: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO>;
  resendOTP(passedData: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO>;
  tutorLogin(loginData: TutorLoginRequestDTO): Promise<TutorLoginResponseDTO>;
  fetchTutors(): Promise<FetchTutorsResponseDTO>;
  blockUnblock(data: BlockUnblockRequestDTO): Promise<BlockUnblockResponseDTO>;
  handleCoursePurchase (paymentEvent: AddStudentRequestDTO): Promise<void>
  handleOrderTransactionFail(failedTransactionEvent:AddStudentRequestDTO): Promise<void>;
  addCourseToTutor(data:{tutorId:string,courseId:string}):Promise<{success:boolean, status:number}>
  checkIsBlocked(data: {tutorId:string}): Promise<{isBlocked:boolean | undefined}>;
  resetPassword(data: {tutorId:string, password:string}):Promise<{message:string,success:boolean,status:number}>
  sendEmailOtp (data: {email:string}):Promise<{message:string,success:boolean, status:number, email?:string,otpId?: ObjectId ,tutorId?:string}>
  resetPasswordVerifyOTP(data: {email:string,enteredOTP:string}): Promise <{success:boolean, message:string,status:number,email:string,tutorId?:string}>
  resendEmailOtp (data: {email: string,otpId:string}): Promise<{success:boolean, status:number, message:string}>
  uploadPdf(data: UploadPdfDTO): Promise<UploadPdfResponseDTO>;
  uploadImage(data: UploadImageDTO): Promise<UploadImageResponseDTO>;
  addRegistrationDetails(data:AddRegistrationDetailsRequest):Promise<{success:boolean, message:string, tutorData?:ITutor}>;
  fetchTutorDetails(data:{tutorId:string}):Promise<{success:boolean, status:number,tutorData?:ITutor}>;
  updateTutorDetails(data:{formData:ITutor}):Promise <{success:boolean, status:number, message:string}>;
  fetchAllStudentIds( data: {tutorId:string}):Promise<{success:boolean, message:string, studentIds?:string[]}>

}

