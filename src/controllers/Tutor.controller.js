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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorController = void 0;
const Tutor_service_1 = require("../Services/Tutor.service");
const tutorService = new Tutor_service_1.TutorService();
class TutorController {
    signup(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutorData = call.request;
                const response = yield tutorService.tutorRegister(tutorData);
                callback(null, { success: response.success, msg: response.message, tempId: response.tempId, email: response.email });
            }
            catch (err) {
                callback(err);
            }
        });
    }
    verifyOtp(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = call.request;
                const response = yield tutorService.VerifyOtp(data);
                callback(null, response);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    resendOtp(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = call.request;
                const response = yield tutorService.ResendOTP(data);
                callback(null, response);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    tutorLogin(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = call.request;
                const response = yield tutorService.tutorLogin(data);
                callback(null, response);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    blockUnblock(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutorId = call.request;
                const response = yield tutorService.blockUnblock(tutorId);
                callback(null, response);
            }
            catch (error) {
                callback(error);
            }
        });
    }
    fetchTutors(_call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield tutorService.fetchTutors();
                callback(null, response);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    addStudent(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = call.request;
                const response = yield tutorService.addToSutdentList(data);
                callback(null, response);
            }
            catch (err) {
                callback(err);
            }
        });
    }
}
exports.TutorController = TutorController;
