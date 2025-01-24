import TutorModel, { TempTutor, Otp } from "../../Schemas/Tutor.Schema";
import { ITutor, ITempTutor, IOTP } from "../../Interfaces/Models/ITutor";
import { ITutorRepository } from "../../Interfaces/IRepositories/IRepository.interface";
import dotenv from "dotenv";
import { AddToStudentListResponse, BlockUnblockTutorResponse, AddRegistrationDetailsRequest } from "../../Interfaces/DTOs/IRepository.dto";
import { BaseRepository } from "../BaseRepository/Base.Repository";
import { ObjectId } from "mongodb";
import { StatusCode } from "../../Interfaces/Enums/Enums";
import mongoose from "mongoose";


dotenv.config();

class TutorRepository extends BaseRepository<ITutor> implements ITutorRepository {

    constructor() {
        super(TutorModel);
    }

    async findByEmail(email: string): Promise<ITutor | null> {
        try {
            const tutor = await this.findOne({ email })
            console.log(tutor, 'email in tutorRepository')
            return tutor;
        } catch (err) {
            console.error(`Error finding tutor by email: ${err}`);
            return null;
        }
    }

    async createTempTutor(tempTutorData: Partial<ITempTutor>): Promise<ITempTutor | null> {
        try {
            const { tutorData, otp, createdAt } = tempTutorData;

            const createdTempData = new TempTutor({
                tutorData,
                otp,
                createdAt: createdAt || new Date()
            });
            const savedTutor = await createdTempData.save();
            return savedTutor;
        } catch (err) {
            console.error("Error creating temporary tutor data", err);
            return null;
        }
    }


    async createTutor(tutorData: Partial<ITutor>): Promise<ITutor | null> {
        try {
            const { firstName, lastName, email, password } = tutorData;
            console.log(tutorData)

            const savedTutor = this.create({
                firstName,
                lastName,
                email,
                password,
                profilePicture: tutorData.profilePicture || "",
            });

            return savedTutor;
        } catch (err) {
            console.error("Error creating tutor:", err);
            return null;
        }
    }

    async addCourseToTutor(tutorId: string, courseId: string): Promise<{ success: boolean, status: number }> {
        try {
            const validCourseId = new mongoose.Types.ObjectId(courseId); // Ensure courseId is an ObjectId

            // Use the `findByIdAndUpdate` method with `$addToSet` operator
            const updatedTutor = await TutorModel.findByIdAndUpdate(
                tutorId,
                {
                    $addToSet: { courses: { course: validCourseId, students: [] } } // Avoids duplicates and adds course
                },
                { new: true, upsert: true } // Returns updated document
            );

            if (!updatedTutor) {
                return { success: false, status: StatusCode.Conflict };
            }

            console.log('Course added successfully:', updatedTutor);
            return { success: true, status: StatusCode.Created };
        } catch (error) {
            console.error('Error adding course:', error);
            throw error;
        }
    }


    async blockUnblock(tutorId: string): Promise<BlockUnblockTutorResponse> {
        try {
            const user = await this.findById(tutorId)
            if (!user) {
                return { success: false, message: "User not found." }
            }
            user.isblocked = !user.isblocked;
            await user.save()
            return { success: true, message: `User ${user.isblocked ? 'blocked' : "Unblocked"} successfully` };
        } catch (error) {
            console.error('Error toggling user block status:', error);
            return { success: false, message: 'An error occurred' };
        }
    }



    async getAllTutors(): Promise<ITutor[] | null> {
        try {
            const tutors = await this.findAll();
            return tutors;
        } catch (err) {
            console.error("error getting users: ", err);
            return null
        }
    }
    async addToSutdentList(tutorId: string, courseId: string, userId: string): Promise<AddToStudentListResponse> {
        try {
            // First, check if the course is already in the cart
            const tutor = await this.findById(tutorId);
            const userObjectId = new ObjectId(userId);
            const courseObjectId = new ObjectId(courseId);
            if (tutor) {
                console.log('tutor found, ', tutor);
                // Find the specific course by courseId within the tutor's courses array
                const course = tutor.courses.find(c => c.course.toString() === courseObjectId.toString());

                if (course) {
                    console.log('course found, ', course)
                    // Check if the userId is already in the students array
                    const isStudentAlreadyAdded = course.students.some(studentId => studentId.equals(userObjectId));

                    if (!isStudentAlreadyAdded) {
                        console.log('student is adding')
                        // Add userId to the students array
                        course.students.push(userObjectId);
                        const savedTutor = await tutor.save();
                        console.log(savedTutor, 'saved tutor');
                        return { message: 'Student added to course student list', success: true };
                    } else {
                        console.log('already exist')
                        return { message: 'Exists', success: true };
                    }
                } else {
                    return { message: 'Course not found for this tutor.', success: false };
                }
            } else {
                return { message: 'Tutor not found.', success: false };
            }
        } catch (error) {
            console.error('Error repo adding students:', error);
            throw new Error('Failed to update cart');
        }
    }

    async removeFromStudentList(tutorId: string, courseId: string, userId: string): Promise<AddToStudentListResponse> {
        try {
            // Find the tutor by tutorId
            const tutor = await this.findById(tutorId);
            const userObjectId = new ObjectId(userId);
            const courseObjectId = new ObjectId(courseId);

            if (tutor) {
                // Find the specific course by courseId within the tutor's courses array
                const course = tutor.courses.find(c => new ObjectId(c._id as string).equals(courseObjectId));

                if (course) {
                    // Check if the userId is in the students array
                    const isStudentPresent = course.students.some(studentId => studentId.equals(userObjectId));

                    if (isStudentPresent) {
                        // Remove userId from the students array
                        course.students = course.students.filter(studentId => !studentId.equals(userObjectId));
                        await tutor.save();

                        return { message: 'Student removed from course student list', success: true };
                    } else {
                        return { message: 'Student not found in course student list', success: false };
                    }
                } else {
                    return { message: 'Course not found for this tutor.', success: false };
                }
            } else {
                return { message: 'Tutor not found.', success: false };
            }
        } catch (error) {
            console.error('Error removing student from course:', error);
            throw new Error('Failed to update student list');
        }
    }
    async updateWallet(tutorId: string, tutorShare: number): Promise<{ message: string, success: boolean }> {
        try {
            const tutor = await this.findById(tutorId);
            if (tutor) {
                tutor.wallet += tutorShare;
                const updatedTutor = await tutor.save()
                if (!updatedTutor) {
                    return { message: 'Student not saved student list', success: false };
                }
                return { message: 'Student added to course student list', success: true };
            } else {
                console.log("tutor not found to update wallet.")
                throw Error
            }
        } catch (error) {
            console.error('Error updating wallet.')
            throw Error
        }
    }
    async isBlocked(tutorId: string): Promise<boolean | undefined> {
        try {
            const tutor: ITutor | null = await this.findById(tutorId)
            return tutor?.isblocked
        } catch (error) {
            throw new Error("Tutor not found");
        }
    }

    async passwordChange(tutorId: string, newPassword: string): Promise<{ message: string, success: boolean, status: number }> {
        try {
            const tutor: ITutor | null = await this.findById(tutorId);
            if (!tutor) {
                return { message: 'User not found!', success: false, status: StatusCode.NotFound };
            }
            // Ensure password is hashed before saving (if necessary)
            tutor.password = newPassword
            await tutor.save(); // Save the updated user with the new password
            return { message: 'Password updated successfully!', success: true, status: StatusCode.OK };
        } catch (error) {
            throw new Error("User not found");
        }
    }

    async storeOTP(email: string, otp: string): Promise<ObjectId> {
        try {
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Use findOneAndUpdate to either update or create the OTP entry
            const otpEntry = await Otp.findOneAndUpdate(
                { email }, // Find the entry with the same email
                { otp, expiresAt }, // Update the OTP and expiration time
                { new: true, upsert: true } // Options: return the updated document and create if it doesn't exist
            );

            console.log(otpEntry, 'otpentry');
            return otpEntry._id as ObjectId;
        } catch (error: unknown) {
            console.log(error);
            throw new Error("User not found");
        }
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const otpEntry = await Otp.findOne({ email, otp, expiresAt: { $gt: new Date() } });
        return otpEntry !== null;
    }

    async addRegistrationDetails(data: AddRegistrationDetailsRequest): Promise<{ success: boolean, message: string, tutorData?: ITutor }> {
        const tutor: ITutor | null = await this.findById(data.tutorId)
        const { bio, expertise, qualifications, profilePicture, cv } = data;
        // Null check for tutor
        if (!tutor) {
            return { success: false, message: 'Tutor not found!' };
        }
        tutor.bio = bio;
        tutor.expertise = expertise;
        tutor.qualifications = qualifications;
        tutor.profilePicture = profilePicture;
        tutor.cv = cv;

        // Save the updated tutor profile
        const savedTutor = await tutor.save();
        return { success: true, message: 'Tutor registration details updated successfully!', tutorData: savedTutor };

    }

    async updateStoredOTP(otpId: string, otp: string): Promise<IOTP> {
        try {
            const otpEntry = await Otp.findOneAndUpdate(
                { _id: otpId }, // Find by otpId
                { otp }, // Update the OTP and expiration time
                { new: true, upsert: true } // Return updated doc, create if not exists
            );

            if (!otpEntry) {
                throw new Error('Failed to update or create OTP entry.');
            }

            return otpEntry;
        } catch (error) {
            console.error('Error updating OTP entry:', error);
            throw error; // Optionally rethrow the error for higher-level handling
        }
    }

    async getTutorDetails(tutorId: string): Promise<{ success: boolean, status: number, tutorData?: ITutor }> {
        const tutor = await this.findById(tutorId)
        if (tutor) {
            return { success: true, status: StatusCode.Found, tutorData: tutor }
        }
        return { success: false, status: StatusCode.NotFound }
    }

    async udpateTutorProfilePicture(tutorId: string, photoUrl: string): Promise<ITutor> {
        const updatedTutor = await TutorModel.findByIdAndUpdate(tutorId, { $set: { profilePicture: photoUrl } }, { new: true, runValidators: true })
        if (!updatedTutor) {
            throw new Error('Tutor not found');
        }
        return updatedTutor;
    }

    async updateTutor(dataToUpdate: Partial<ITutor>): Promise<ITutor> {
        try {
            const updatedTutor = await TutorModel.findByIdAndUpdate(
                dataToUpdate.tutorId,
                {
                    $set: {
                        firstName: dataToUpdate.firstName,
                        lastName: dataToUpdate.lastName,
                        email: dataToUpdate.email,
                        phoneNumber: dataToUpdate.phoneNumber,
                        bio: dataToUpdate.bio,
                        expertise: dataToUpdate.expertise,
                        qualifications: dataToUpdate.qualifications,
                        profilePicture: dataToUpdate.profilePicture,
                        cv: dataToUpdate.cv,
                        wallet: dataToUpdate.wallet,
                    },
                },
                { new: true, runValidators: true } // Returns updated document & applies schema validations
            );

            if (!updatedTutor) {
                throw new Error('Tutor not found');
            }

            return updatedTutor;
        } catch (error) {
            console.error("Error updating tutor:", error);
            throw error;
        }
    }

    async getAllStudentIds(tutorId: string): Promise<{ success: boolean, message: string, studentIds?: string[] }> {
        try {
            console.log(tutorId)
            const tutor = await TutorModel.findById(tutorId)
            console.log(tutor, 'tutor from repo')
            if (!tutor) {
                return { success: false, message: 'tutor not found' }
            }
            const studentsSet = new Set<string>();
            tutor.courses.forEach(course => {
                course.students.forEach(studentId => studentsSet.add(studentId.toString()));
            })
            return { studentIds: Array.from(studentsSet), success: true, message: 'Student ids found' };
        } catch (error) {
            console.error("Error updating tutor:", error);
            throw error;
        }
    }
};

export default TutorRepository