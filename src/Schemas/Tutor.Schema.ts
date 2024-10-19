import mongoose, { Document, Schema,Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ITutor,ITempTutor } from "../Interfaces/Models/ITutor";
import { configs } from "../Configs/ENV.cofnigs/ENV.configs";


const TutorSchema: Schema <ITutor> = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isblocked: {
        type: Boolean,
        default: false,
    },
    students:[{
        type: Schema.Types.ObjectId,
    }],
    wallet: {
        type: Number,
        default:0
    }
})
 
const TempTutorShcema: Schema <ITempTutor> = new Schema({
    tutorData: {
        type: Object,
        require: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type:Date,
        default: Date.now,
        expires: 900 // expires after 15 minutes
    }
}
,
{
    timestamps: true,
})

const otpSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  });

TutorSchema.methods.toggleBlockStatus = async function (): Promise<void> {
    this.isblocked = !this.isblocked; // Toggle the blocked status
    await this.save(); // Save the updated document
};

TutorSchema.methods.unblock = async function (): Promise<void> {
    this.isblocked = false;
    await this.save();
};

TutorSchema.methods.block = async function (): Promise<void> {
    this.isblocked = true;
    await this.save();
};


// Hash password
TutorSchema.pre<ITutor>("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password || "", 10);
    next();
});

// sign access token
TutorSchema.methods.SignAccessToken = function () {
    return jwt.sign(
      { id: this._id, role: this.role },
       configs.JWT_SECRET || "",
      {
        expiresIn: configs.JWT_EXPIRATION_TIME,
      }
    );
  };



// sign refresh token
TutorSchema.methods.SignRefreshToken = function () { 
    return jwt.sign(
      { id: this._id, role: this.role },
      configs.REFRESH_TOKEN_SECRET || "",
      {
        expiresIn: configs.JWT_EXPIRATION_TIME,
      }
    );
};

// compare password
TutorSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};


export const Otp = mongoose.model("setOTP",otpSchema)
export const TempTutor = mongoose.model<ITempTutor>("TempTutorData",TempTutorShcema)
const TutorModel = mongoose.model<ITutor>("Tutor", TutorSchema);

export default TutorModel; 