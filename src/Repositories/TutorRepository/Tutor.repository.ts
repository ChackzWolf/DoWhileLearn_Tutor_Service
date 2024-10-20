import TutorModel, { TempTutor,Otp } from "../../Schemas/Tutor.Schema";
import { ITutor,ITempTutor } from "../../Interfaces/Models/ITutor";
import { ITutorRepository } from "../../Interfaces/IRepositories/IRepository.interface";
import dotenv from "dotenv";
import { AddToStudentListResponse, BlockUnblockTutorResponse, AddRegistrationDetailsRequest } from "../../Interfaces/DTOs/IRepository.dto";
import { BaseRepository } from "../BaseRepository/Base.Repository";
import { ObjectId } from "mongodb";
import { StatusCode } from "../../Interfaces/Enums/Enums";


dotenv.config();

class tutorRepository extends BaseRepository<ITutor> implements ITutorRepository{

    constructor() {
        super(TutorModel);
    }
    
    async findByEmail (email: string): Promise<ITutor | null>{
        try {
            const tutor = await this.findOne({ email })
            console.log(tutor, 'email in tutorRepository')
            return tutor;
        } catch (err) {
            console.error(`Error finding tutor by email: ${err}`);
            return null;
        }
    }
    
    async createTempTutor(tempTutorData: Partial<ITempTutor>): Promise<ITempTutor | null>{
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
            const { firstName, lastName, email, password } = tutorData ;
            const savedTutor = this.create({
                firstName,
                lastName,
                email,
                password,
            });
           
            return savedTutor;
        } catch (err) {
            console.error("Error creating tutor:", err);
            return null;
        }
    }
    async blockUnblock(tutorId: string): Promise<BlockUnblockTutorResponse> {
        try{
            const user = await this.findById(tutorId)
            if(!user){
                return {success:false, message: "User not found."}
            }
            user.isblocked = !user.isblocked;
            await user.save()
            return {success: true, message: `User ${user.isblocked? 'blocked': "Unblocked"} successfully`};
        }catch (error) {
            console.error('Error toggling user block status:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    

    async getAllTutors():Promise<ITutor[] | null> {
        try{
            const tutors = await this.findAll();
            return  tutors;
        }catch(err){
            console.error("error getting users: " , err);
            return null
        }
    }
    async addToSutdentList(userId: string, tutorId: string, tutorShare: number): Promise<AddToStudentListResponse> {
        try {
          // First, check if the course is already in the cart
            const tutor = await this.findById(tutorId);
            const userObjectId = new ObjectId(userId);
            if(tutor){
                if(!tutor.students.includes(userObjectId)){ 
                  tutor.students.push(userObjectId);
                  await tutor.save();
                  return { message: 'Student added to Purchase List', success:true};
                }else{
                  return { message: 'Student already in purchase list', success:false};
                }
              }else{
                return { message: 'Tutor not found.', success:false};
              }
          
        } catch (error) {
          console.error('Error toggling course in cart:', error);
          throw new Error('Failed to update cart');
        }
      }

      async isBlocked(tutorId: string): Promise<boolean | undefined> {
        try {
          const tutor : ITutor | null= await this.findById(tutorId)
          return tutor?.isblocked
        } catch (error) {
          throw new Error("Tutor not found");
        }
      }

      async passwordChange(tutorId:string,newPassword:string):Promise<{message:string,success:boolean,status:number}>{
        try{
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

      async storeOTP(email: string, otp: string) {
        try {
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            
            // Use findOneAndUpdate to either update or create the OTP entry
            const otpEntry = await Otp.findOneAndUpdate(
                { email }, // Find the entry with the same email
                { otp, expiresAt }, // Update the OTP and expiration time
                { new: true, upsert: true } // Options: return the updated document and create if it doesn't exist
            );
    
            console.log(otpEntry, 'otpentry');
        } catch (error: unknown) {
            console.log(error);
        }
    }

      async verifyOTP(email:string, otp:string) {
        const otpEntry = await Otp.findOne({ email, otp, expiresAt: { $gt: new Date() } });
        return otpEntry !== null;
      }

      async addRegistrationDetails(data:AddRegistrationDetailsRequest) {
        const tutor: ITutor | null= await this.findById(data.tutorId)
        const {bio,expertise,qualifications,profilePicture,cv} = data;
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
        await tutor.save();
        return { success: true, message: 'Tutor registration details updated successfully!' };

      } 
    
};

export default tutorRepository