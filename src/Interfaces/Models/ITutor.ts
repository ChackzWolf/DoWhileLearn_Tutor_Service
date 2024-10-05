import mongoose, { Document, Schema,Types } from "mongoose";



export interface ITutor extends Document {
    _id:string
    firstName:string;
    lastName:string;
    email: string;
    password: string;
    isblocked: boolean;
    students:mongoose.Types.ObjectId[];
    wallet: number;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
    block(): Promise<void>;
    unblock(): Promise<void>;
    toggleBlockStatus(): Promise<void>;
}

export interface ITempTutor extends Document {
    tutorData: ITutor;
    otp: string;
    createdAt: Date;
    _id: Types.ObjectId; // This is the correct type for MongoDB _id
}