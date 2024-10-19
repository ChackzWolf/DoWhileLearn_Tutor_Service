import { ITutor } from "../Models/ITutor";


/////////////////_________RESPONSE DTOs_________/////////////////

// DTO for tutor registration response
export interface TutorSignupResponseDTO {
    success: boolean;
    message: string;
    tempId?: string;
    email?: string;
}

// DTO for verifying OTP response
export interface VerifyOtpResponseDTO {
    success: boolean;
    message: string;
    tutorData?: ITutor;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
}

// DTO for resending OTP response
export interface ResendOtpResponseDTO {
    success: boolean;
    message: string;
}

// DTO for tutor login response
export interface TutorLoginResponseDTO {
    success: boolean;
    message: string;
    tutorData?: ITutor;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
}

// DTO for fetching tutors response
export interface FetchTutorsResponseDTO {
    success: boolean;
    tutors?: ITutor[];
}

// DTO for block/unblock response
export interface BlockUnblockResponseDTO {/////////////////////////////////////////////////////
    success: boolean;
    message?: string;
}

// DTO for adding a student to a tutor’s list
export interface AddStudentResponseDTO {
    success: boolean;
    message?: string;
    status: number;
}

/////////////////_________REQUESTS DTOs_________/////////////////

// DTO for creating a tutor
export interface TutorSignupRequestDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// DTO for verifying OTP
export interface VerifyOtpRequestDTO {
    enteredOTP: string;
    email: string;
    tempId: string;
}

// DTO for resending OTP
export interface ResendOtpRequestDTO {
    email: string;
    tempId: string;
}

// DTO for tutor login request
export interface TutorLoginRequestDTO {
    email: string;
    password: string;
}

// DTO for blocking/unblocking a tutor
export interface BlockUnblockRequestDTO {
    tutorId: string;
}

// DTO for adding a student to a tutor’s list
export interface AddStudentRequestDTO {
    tutorId: string;
    userId: string;
    tutorShare: number;
}

  // DTO for image upload
  export interface UploadImageDTO {
    imageBinary: Buffer;
    imageName: string;
  }
  
  export interface UploadImageResponseDTO {
    success: boolean;
    message: string;
    s3Url?: string;
  }

// DTO for image upload
export interface UploadPdfDTO {
    pdfBinary: Buffer;
    pdfName: string;
  }
  
  export interface UploadPdfResponseDTO {
    success: boolean;
    message: string;
    s3Url?: string;
  }

