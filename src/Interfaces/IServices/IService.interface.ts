
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
  tutorRegister(tutorData: TutorSignupRequestDTO): Promise <TutorSignupResponseDTO>;

  VerifyOtp(passedData: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO>;

  ResendOTP(passedData: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO>;

  tutorLogin(loginData: TutorLoginRequestDTO): Promise<TutorLoginResponseDTO>;

  fetchTutors(): Promise<FetchTutorsResponseDTO>;

  blockUnblock(data: BlockUnblockRequestDTO): Promise<BlockUnblockResponseDTO>;

  addToSutdentList (data: AddStudentRequestDTO):Promise<AddStudentResponseDTO>
}

