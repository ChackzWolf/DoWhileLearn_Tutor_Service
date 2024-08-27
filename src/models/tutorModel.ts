import mongoose, { Document, Schema,Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export interface ITutor extends Document {
    firstName:string;
    lastName:string;
    email: string;
    password: string;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

export interface ITempTutor extends Document {
    tutorData: ITutor;
    otp: string;
    createdAt: Date;
    _id: Types.ObjectId; // This is the correct type for MongoDB _id
}

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
      process.env.ACCESS_TOKEN || "",
      {
        expiresIn: "5m",
      }
    );
  };



// sign refresh token
TutorSchema.methods.SignRefreshToken = function () {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.REFRESH_TOKEN || "",
      {
        expiresIn: "3d",
      }
    );
};

// compare password
TutorSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};



export const TempTutor = mongoose.model<ITempTutor>("TempTutorData",TempTutorShcema)
const TutorModel = mongoose.model<ITutor>("Tutor", TutorSchema);

export default TutorModel; 