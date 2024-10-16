import { config } from "dotenv";
import nodemailer from "nodemailer"
import { configs } from "../Configs/ENV.cofnigs/ENV.configs";


export const SendVerificationMail = async (email: string, otp: string): Promise<void> => {
    try {

        console.log('Sender email : ',configs.DWL_EMAIL)
        console.log('Receiver email : ',email)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: configs.DWL_EMAIL,
                pass: configs.DWL_PASSWORD
            },
        });
        console.log('mail');

        const mailOptions = {
            from: 'DoWhileLearn <dowhilelearn@gmail.com>',
            to: email,
            subject: 'Email Verification',
            html: `<p> Hello tutor. Please enter the code:${otp}  to verify your email address.</p>`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(`Failed to send verification email: ${error}`);
    }
};
