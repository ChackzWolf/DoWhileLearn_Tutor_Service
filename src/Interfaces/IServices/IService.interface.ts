
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

  verifyOtp(passedData: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO>;

  resendOTP(passedData: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO>;

  tutorLogin(loginData: TutorLoginRequestDTO): Promise<TutorLoginResponseDTO>;

  fetchTutors(): Promise<FetchTutorsResponseDTO>;

  blockUnblock(data: BlockUnblockRequestDTO): Promise<BlockUnblockResponseDTO>;

  handleCoursePurchase (data: AddStudentRequestDTO):Promise<AddStudentResponseDTO | undefined>
}

