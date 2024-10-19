import { ITutor } from "../Models/ITutor";
import { StatusCode } from "../Enums/Enums";

// DTO for signup response
export interface TutorSignupResponseDTO {
    success: boolean;
    msg: string;
    tempId?: string;
    email?: string;
}

// DTO for verify OTP response
export interface TutorVerifyOtpResponseDTO {
    success: boolean;
    message: string;
    tutorData?: ITutor;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
}

// DTO for resend OTP response
export interface TutorResendOtpResponseDTO {
    success: boolean;
    message: string;
}

// DTO for login response
export interface TutorLoginResponseDTO {
    success: boolean;
    message: string;
    tutorData?: ITutor;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
}

// DTO for fetch tutors response
export interface FetchTutorsResponseDTO {
    success: boolean;
    tutors?: ITutor[];
}

// DTO for block/unblock response
export interface BlockUnblockResponseDTO {
    success: boolean;
    message?: string;
}

// DTO for add to student list response
export interface AddStudentResponseDTO {
    success: boolean;
    message?: string;
    status: StatusCode;
}


// Interface for signup request
export interface TutorSignupRequestDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// Interface for verify OTP request
export interface TutorVerifyOtpRequestDTO {
    enteredOTP: string;
    email: string;
    tempId: string;
}

// Interface for resend OTP request
export interface TutorResendOtpRequestDTO {
    enteredOTP: string;
    email: string;
    tempId: string;
}

// Interface for login request
export interface TutorLoginRequestDTO {
    email: string;
    password: string;
}

// Interface for block/unblock request
export interface BlockUnblockRequestDTO {
    tutorId: string;
}

// Interface for adding a student to a tutor’s list
export interface AddStudentRequestDTO {
    tutorId: string;
    userId: string;
    tutorShare: number;
}


export interface ImageRequest {
    imageBinary: Buffer;
    imageName: string;
  }
  
  export interface ImageResponse {
    message: string;
    s3Url?: string;
    success: boolean;
  }


  export interface PDFRequest {
    pdfBinary: Buffer;
    pdfName: string;
  }
    
  export interface PDFResponse {
    message: string;
    s3Url?: string;
    success: boolean;
  }