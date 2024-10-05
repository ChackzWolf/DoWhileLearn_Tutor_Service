// ITutorController.ts
import * as grpc from '@grpc/grpc-js';
import {
    TutorSignupRequestDTO,
    TutorSignupResponseDTO,
    TutorVerifyOtpRequestDTO,
    TutorVerifyOtpResponseDTO,
    TutorResendOtpRequestDTO,
    TutorResendOtpResponseDTO,
    TutorLoginRequestDTO,
    TutorLoginResponseDTO,
    BlockUnblockRequestDTO,
    BlockUnblockResponseDTO,
    FetchTutorsResponseDTO,
    AddStudentRequestDTO,
    AddStudentResponseDTO
} from '../DTOs/IController.dto';

export interface ITutorController {
    signup(call: grpc.ServerUnaryCall<TutorSignupRequestDTO, TutorSignupResponseDTO>, callback: grpc.sendUnaryData<TutorSignupResponseDTO>): Promise<void>;

    verifyOtp(call: grpc.ServerUnaryCall<TutorVerifyOtpRequestDTO, TutorVerifyOtpResponseDTO>, callback: grpc.sendUnaryData<TutorVerifyOtpResponseDTO>): Promise<void>

    resendOtp(call: grpc.ServerUnaryCall<TutorResendOtpRequestDTO, TutorResendOtpResponseDTO>, callback: grpc.sendUnaryData<TutorResendOtpResponseDTO>): Promise<void>;

    tutorLogin(call: grpc.ServerUnaryCall<TutorLoginRequestDTO, TutorLoginResponseDTO>, callback: grpc.sendUnaryData<TutorLoginResponseDTO>): Promise<void>;

    blockUnblock(call: grpc.ServerUnaryCall<BlockUnblockRequestDTO, BlockUnblockResponseDTO>, callback: grpc.sendUnaryData<BlockUnblockResponseDTO>): Promise<void>;

    fetchTutors(_call: grpc.ServerUnaryCall<any, FetchTutorsResponseDTO>, callback: grpc.sendUnaryData<FetchTutorsResponseDTO>): Promise<void>;

    addStudent(call: grpc.ServerUnaryCall<AddStudentRequestDTO, AddStudentResponseDTO>, callback: grpc.sendUnaryData<AddStudentResponseDTO>): Promise<void>
}
