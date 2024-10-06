"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Tutor_Schema_1 = __importStar(require("../Schemas/Tutor.Schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class tutorRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutor = yield Tutor_Schema_1.default.findOne({ email }).exec(); //.exec() method ensures that the query returns a promise.
                console.log(tutor, 'email in tutorRepository');
                return tutor;
            }
            catch (err) {
                console.error(`Error finding tutor by email: ${err}`);
                return null;
            }
        });
    }
    createTempTutor(tempTutorData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tutorData, otp, createdAt } = tempTutorData;
                const createdTempData = new Tutor_Schema_1.TempTutor({
                    tutorData,
                    otp,
                    createdAt: createdAt || new Date()
                });
                const savedTutor = yield createdTempData.save();
                return savedTutor;
            }
            catch (err) {
                console.error("Error creating temporary tutor data", err);
                return null;
            }
        });
    }
    createTutor(tutorData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { firstName, lastName, email, password } = tutorData;
                const createdTutor = new Tutor_Schema_1.default({
                    firstName,
                    lastName,
                    email,
                    password,
                });
                const savedTutor = yield createdTutor.save();
                return savedTutor;
            }
            catch (err) {
                console.error("Error creating tutor:", err);
                return null;
            }
        });
    }
    blockUnblock(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield Tutor_Schema_1.default.findById(tutorId);
                if (!user) {
                    return { success: false, message: "User not found." };
                }
                yield user.toggleBlockStatus();
                return { success: true, message: `User ${user.isblocked ? 'blocked' : "Unblocked"} successfully` };
            }
            catch (error) {
                console.error('Error toggling user block status:', error);
                return { success: false, message: 'An error occurred' };
            }
        });
    }
    getAllTutors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutors = yield Tutor_Schema_1.default.find();
                return tutors;
            }
            catch (err) {
                console.error("error getting users: ", err);
                return null;
            }
        });
    }
    addToSutdentList(userId, tutorId, tutorShare) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, check if the course is already in the cart
                // If courseId is not in cart, add it
                yield Tutor_Schema_1.default.updateOne({ _id: tutorId }, { $addToSet: { students: userId } } // Add courseId to cart array, ensuring uniqueness
                );
                console.log(tutorShare, 'this is tutor share');
                const addmoney = yield Tutor_Schema_1.default.updateOne({ _id: tutorId }, { $inc: { wallet: tutorShare } } // Increment the wallet by the amountToAdd
                );
                console.log(addmoney, 'added money');
                return { message: 'Course added to Purchase List', success: true };
            }
            catch (error) {
                console.error('Error toggling course in cart:', error);
                throw new Error('Failed to update cart');
            }
        });
    }
}
;
exports.default = tutorRepository;
