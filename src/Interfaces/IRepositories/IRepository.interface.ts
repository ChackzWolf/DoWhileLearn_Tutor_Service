import { ITutor, ITempTutor } from "../../Schemas/Tutor.Schema";

export interface ITutorRepository {
  findByEmail(email: string): Promise<ITutor | null>;
  
  createTempTutor(tempTutorData: Partial<ITempTutor>): Promise<ITempTutor | null>;
  
  createTutor(tutorData: Partial<ITutor>): Promise<ITutor | null>;
  
  blockUnblock(tutorId: string): Promise<{ success: boolean; message?: string }>;
  
  getAllTutors(): Promise<ITutor[] | null>;
}
