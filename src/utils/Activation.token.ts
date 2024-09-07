import dotenv from "dotenv";
import jwt ,{ Secret }from "jsonwebtoken";
import { ITutor } from "../models/Tutor.model";

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if(!JWT_SECRET || !REFRESH_TOKEN_SECRET){
    throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environmental variables. ")
}

const createToken = (tutor:ITutor,role:string) : {accessToken:string,refreshToken:string} =>{

    const accessToken = jwt.sign(
        {
            id : tutor._id,
            role:role,
            email: tutor.email,  
        },JWT_SECRET as Secret,
        { expiresIn: '5m' }
    )
    
    const refreshToken = jwt.sign(
        {
            id: tutor._id,
            role:role,
            email: tutor.email,
        },
        REFRESH_TOKEN_SECRET as Secret,
        {expiresIn: '7d'}
    )

    return {accessToken, refreshToken}
}

export default createToken
