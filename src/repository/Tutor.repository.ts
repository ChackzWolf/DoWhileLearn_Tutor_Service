import TutorModel, {ITutor,ITempTutor,TempTutor} from "../models/Tutor.model";
import { ITutorRepository } from "../interfaces/ITutor.repository";
import dotenv from "dotenv";

dotenv.config();



class tutorRepository implements ITutorRepository{
    
    async findByEmail (email: string): Promise<ITutor | null>{
        try {
            const tutor = await TutorModel.findOne({ email }).exec(); //.exec() method ensures that the query returns a promise.
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


    async createTutor(tutorData: Partial<ITutor>): Promise<ITutor | null>{
        try {
            const { firstName, lastName, email, password } = tutorData ;
            const createdTutor = new TutorModel({
                firstName,
                lastName,
                email,
                password,
            });
            const savedTutor = await createdTutor.save();
            return savedTutor;
        } catch (err) {
            console.error("Error creating tutor:", err);
            return null;
        }
    }

    async blockUnblock(tutorId:string):Promise<{ success: boolean; message?: string }>  {
        try{
            const user = await TutorModel.findById(tutorId)
            if(!user){
                return {success:false, message: "User not found."}
            }
            await user.toggleBlockStatus();
        
            return {success: true, message: `User ${user.isblocked? 'blocked': "Unblocked"} successfully`};
        }catch (error) {
            console.error('Error toggling user block status:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    async getAllTutors() {
        try{
            const tutors = await TutorModel.find();
            return  tutors;
        }catch(err){
            console.error("error getting users: " , err);
            return null
        }
    }

    async addToSutdentList(userId: string, tutorId: string, tutorShare:number):Promise<{message?:string, success:boolean}> {
        try {
          // First, check if the course is already in the cart
    
            // If courseId is not in cart, add it
            await TutorModel.updateOne(
              { _id: tutorId },
              { $addToSet: { students: userId } } // Add courseId to cart array, ensuring uniqueness
            );
                console.log(tutorShare, 'this is tutor share')
            const addmoney = await TutorModel.updateOne(
                { _id: tutorId },
                { $inc: { wallet: tutorShare } }  // Increment the wallet by the amountToAdd
            );
                console.log(addmoney , 'added money')
            
            return { message: 'Course added to Purchase List', success:true};
          
        } catch (error) {
          console.error('Error toggling course in cart:', error);
          throw new Error('Failed to update cart');
        }
      }

};

export default tutorRepository