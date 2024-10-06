"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorService = void 0;
const Tutor_repository_1 = __importDefault(require("../Repositories/Tutor.repository"));
const Tutor_Schema_1 = require("../Schemas/Tutor.Schema");
const dotenv_1 = __importDefault(require("dotenv"));
const Generate_OTP_1 = require("../Utils/Generate.OTP");
const Send_email_1 = require("../Utils/Send.email");
const Activation_token_1 = __importDefault(require("../Utils/Activation.token"));
const Enums_1 = require("../Interfaces/Enums/Enums");
dotenv_1.default.config();
const repository = new Tutor_repository_1.default();
class TutorService {
    tutorRegister(tutorData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`tutorService ${tutorData}`);
                const email = tutorData.email;
                if (email === undefined) {
                    throw new Error("Email is undefined");
                }
                const emailExists = yield repository.findByEmail(email);
                if (emailExists) {
                    console.log('email exists triggered');
                    return { success: false, message: "Email already exists" };
                }
                let otp = (0, Generate_OTP_1.generateOTP)();
                console.log(`OTP : [ ${otp} ]`);
                yield (0, Send_email_1.SendVerificationMail)(email, otp);
                console.log('Email send');
                const tempTutorData = yield repository.createTempTutor({
                    otp,
                    tutorData: tutorData,
                });
                if (tempTutorData) {
                    const tempId = tempTutorData._id.toString(); // Convert ObjectId to string if needed
                    return { success: true, message: "Verification email sent", tempId, email };
                }
                else {
                    throw new Error("Failed to create temporary tutor data.");
                }
            }
            catch (err) {
                throw new Error(`Failed to signup: ${err}`);
            }
        });
    }
    VerifyOtp(passedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('ive vannarnu', passedData);
                const tempTutor = yield Tutor_Schema_1.TempTutor.findById(passedData.tempId);
                if (!tempTutor) {
                    return { success: false, message: "Temp tutor not found." };
                }
                if (tempTutor.otp !== passedData.enteredOTP) {
                    return { success: false, message: "Invalid OTP." };
                }
                const createTutor = yield repository.createTutor(tempTutor.tutorData);
                const _id = createTutor === null || createTutor === void 0 ? void 0 : createTutor._id;
                if (!createTutor) {
                    throw new Error("Failed to create tutor.");
                }
                console.log(createTutor, 'create tutorrr');
                const { accessToken, refreshToken } = (0, Activation_token_1.default)(createTutor, 'TUTOR');
                return { success: true, message: "Tutor has been registered.", tutorData: createTutor, accessToken, refreshToken, _id };
            }
            catch (err) {
                console.error("Error in VerifyOtp:", err);
                return { success: false, message: "An error occurred while verifying OTP." };
            }
        });
    }
    ResendOTP(passedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, tempId } = passedData;
                let newOTP = (0, Generate_OTP_1.generateOTP)();
                console.log(` ressend OTP : [   ${newOTP}   ]`);
                const updatedTempTutor = yield Tutor_Schema_1.TempTutor.findByIdAndUpdate(tempId, { otp: newOTP }, { new: true });
                if (!updatedTempTutor) {
                    console.log('failed to send otp');
                    return { success: false, message: "Register time has expaired. Try registering again" };
                }
                else {
                    yield (0, Send_email_1.SendVerificationMail)(email, newOTP);
                    return { success: true, message: "OTP has been resent" };
                }
            }
            catch (_a) {
                return { success: false, message: "An error occured while Resending OTP" };
            }
        });
    }
    tutorLogin(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = loginData;
                const tutorData = yield repository.findByEmail(email);
                if (tutorData) {
                    const checkPassword = yield tutorData.comparePassword(password);
                    if (checkPassword) {
                        console.log(tutorData, 'kkkkkkkkk');
                        const _id = tutorData._id;
                        const { refreshToken, accessToken } = (0, Activation_token_1.default)(tutorData, "TUTOR");
                        return { success: true, message: "Tutor login successful.", tutorData, refreshToken, accessToken, _id };
                    }
                    else {
                        return { success: false, message: "Invalid password." };
                    }
                }
                else {
                    return { success: false, message: "Invalid email." };
                }
            }
            catch (error) {
                return { success: false, message: "An error occured while loggin in." };
            }
        });
    }
    fetchTutors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutors = yield repository.getAllTutors();
                console.log(tutors, 'students');
                if (tutors) {
                    return { success: true, tutors };
                }
                else {
                    return { success: false };
                }
            }
            catch (err) {
                return { success: false };
            }
        });
    }
    blockUnblock(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(data.tutorId, 'from use case');
                const response = yield repository.blockUnblock(data.tutorId);
                console.log(response);
                if (!response.success) {
                    return { success: false, message: "Error finding tutor." };
                }
                return { success: true, message: response.message };
            }
            catch (error) {
                return { success: false, message: "an error occured." };
            }
        });
    }
    addToSutdentList(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(data);
                const response = yield repository.addToSutdentList(data.userId, data.tutorId, data.tutorShare);
                console.log(response);
                if (response.success) {
                    return { message: response.message, success: true, status: Enums_1.StatusCode.Created };
                }
                else {
                    return { message: "error creating order", success: false, status: Enums_1.StatusCode.NotFound };
                }
            }
            catch (error) {
                console.log(error);
                return { message: "Error occured while creating order", success: false, status: Enums_1.StatusCode.ExpectationFailed };
            }
        });
    }
}
exports.TutorService = TutorService;
