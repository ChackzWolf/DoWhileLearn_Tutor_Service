import TutorModel, {ITutor,ITempTutor,TempTutor} from "../models/tutorModel";
import dotenv from "dotenv";

dotenv.config();



class tutorRepository {
    
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

};

export default tutorRepository