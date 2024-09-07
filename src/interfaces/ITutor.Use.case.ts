// ITutorUseCase.ts
import { ITutor } from "../models/Tutor.model";

export interface ITutorUseCase {
  tutorRegister(tutorData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
    tempId?: string;
    email?: string;
  }>;

  VerifyOtp(passedData: {
    enteredOTP: string;
    email: string;
    tempId: string;
  }): Promise<{
    success: boolean;
    message: string;
    tutorData?: any;
    accessToken?: string;
    refreshToken?: string;
  }>;

  ResendOTP(passedData: {
    email: string;
    tempId: string;
  }): Promise<{ success: boolean; message: string }>;

  tutorLogin(loginData: {
    email: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
    tutorData?: ITutor;
    accessToken?: string;
    refreshToken?: string;
  }>;

  fetchTutors(): Promise<{ success: boolean; tutors?: ITutor[] }>;

  blockUnblock(data: {
    tutorId: string;
  }): Promise<{ success: boolean; message?: string }>;
}
