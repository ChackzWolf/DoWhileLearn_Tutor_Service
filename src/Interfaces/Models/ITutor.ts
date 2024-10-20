import mongoose, { Document, Schema,Types } from "mongoose";


// Qualification Interface
export interface IQualification {
    qualification: string;
    certificate: string;
}

// Interface for the course document
export interface ICourses extends Document {
    course: string;
    students: Types.ObjectId[]; // Array of student ObjectIds
}


export interface ITutor extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isblocked: boolean;
    bio: string; // Bio field
    expertise: string[]; // Array of expertise (repeated string in gRPC)
    qualifications: IQualification[]; // Array of Qualification objects
    profilePicture: string; // Profile picture URL
    cv: string; // CV URL
    courses: ICourses[]
    students: mongoose.Types.ObjectId[]; // Array of student ObjectIds
    wallet: number;
    
    // Methods
    comparePassword: (password: string) => Promise<boolean>; // Password comparison
    SignAccessToken: () => string; // Generate Access Token
    SignRefreshToken: () => string; // Generate Refresh Token
    block(): Promise<void>; // Block the tutor
    unblock(): Promise<void>; // Unblock the tutor
    toggleBlockStatus(): Promise<void>; // Toggle block/unblock status
}


export interface ITempTutor extends Document {
    tutorData: ITutor;
    otp: string;
    createdAt: Date;
    _id: Types.ObjectId; // This is the correct type for MongoDB _id
}