// ITutorUseCase.ts
import { ITutor } from "../Models/ITutor";
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
        BlockUnblockRequestDTO
        } from '../DTOs/IService.dto'
export interface ITutorUseCase {
  tutorRegister(tutorData: CreateTutor): Promise <TutorSignupResponseDTO>;

  VerifyOtp(passedData: {
    enteredOTP: string;
    email: string;
    tempId: string;
  }): Promise<VerifyOtpResponseDTO>;

  ResendOTP(passedData: {
    email: string;
    tempId: string;
  }): Promise<ResendOtpResponseDTO>;

  tutorLogin(loginData: {
    email: string;
    password: string;
  }): Promise<TutorLoginResponseDTO>;

  fetchTutors(): Promise<FetchTutorsResponseDTO>;

  blockUnblock(data: {
    tutorId: string;
  }): Promise<BlockUnblockResponseDTO>;///////////////////////////////////////////////////
}
