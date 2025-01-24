import { ITutor, ITempTutor, IOTP } from "../Models/ITutor";
import {
        BlockUnblockTutorResponse,
        AddToStudentListResponse,
        AddRegistrationDetailsRequest
        } from '../DTOs/IRepository.dto'
import { ObjectId } from "mongodb";

export interface ITutorRepository {
  udpateTutorProfilePicture(tutorId:string ,photoUrl:string):Promise<ITutor>
  findByEmail(email: string): Promise<ITutor | null>;
  addCourseToTutor(tutorId: string, courseId: string):Promise<{success:boolean, status:number}>
  addToSutdentList(userId: string, tutorId: string,courseId:string): Promise<AddToStudentListResponse>;
  isBlocked(tutorId: string): Promise<boolean | undefined> 
  createTempTutor(tempTutorData: Partial<ITempTutor>): Promise<ITempTutor | null>;
  updateWallet(tutorId:string,tutorShare:number):Promise<{message:string, success:boolean}>
  createTutor(tutorData: Partial<ITutor>): Promise<ITutor | null>;
  removeFromStudentList( tutorId: string, courseId: string ,  userId: string): Promise<AddToStudentListResponse>
  blockUnblock(tutorId: string): Promise<BlockUnblockTutorResponse>;
  passwordChange(tutorId:string,newPassword:string):Promise<{message:string,success:boolean,status:number}>
  getAllTutors(): Promise<ITutor[] | null>;
  storeOTP(email: string, otp: string):Promise<ObjectId>
  verifyOTP(email:string, otp:string):Promise<boolean>
  updateStoredOTP(otpId: string, otp: string): Promise<IOTP>
  addRegistrationDetails(data:AddRegistrationDetailsRequest):Promise<{success:boolean, message:string, tutorData?:ITutor}> 
  getTutorDetails(tutorId:string):Promise<{success:boolean, status:number, tutorData?:ITutor}>
  updateTutor( dataToUpdate: Partial<ITutor>) :Promise<ITutor>;
  getAllStudentIds (tutorId:string):Promise<{success:boolean, message:string, studentIds?:string[]}>;
}
