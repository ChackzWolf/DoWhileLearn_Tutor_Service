import { ITutor, ITempTutor } from "../Models/ITutor";
import {
        BlockUnblockTutorResponse,
        AddToStudentListResponse,
        AddRegistrationDetailsRequest
        } from '../DTOs/IRepository.dto'
export interface ITutorRepository {
  findByEmail(email: string): Promise<ITutor | null>;
  
  createTempTutor(tempTutorData: Partial<ITempTutor>): Promise<ITempTutor | null>;
  
  createTutor(tutorData: Partial<ITutor>): Promise<ITutor | null>;
  
  blockUnblock(tutorId: string): Promise<BlockUnblockTutorResponse>;
  
  getAllTutors(): Promise<ITutor[] | null>;

  addToSutdentList(userId: string, tutorId: string, tutorShare:number):Promise<AddToStudentListResponse> 
}
