import { ITutor } from "../Models/ITutor";



export interface BlockUnblockTutorResponse {
    success:boolean;
    message?:string;
}
export interface AddToStudentListResponse {
    message?:string;
    success:boolean;
}
export interface AddRegistrationDetailsRequest {
    tutorId: string;
    bio: string;
    expertise: string[];
    qualifications: { qualification: string; certificate: string }[];
    profilePicture: string;
    cv: string;
}

