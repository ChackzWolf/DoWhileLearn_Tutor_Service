import nodemailer from "nodemailer"
import { configs } from "../Configs/ENV.cofnigs/ENV.configs";
import { IEmailService } from "../Interfaces/IUtils/IEmailService";

export class EmailService implements IEmailService {
    async sendVerificationMail(email: string, otp: string): Promise<void>  {
        try {

            console.log('Sender email : ',configs.DWL_EMAIL)
            console.log('Receiver email : ',email)
            console.log('Sender password : ',configs.EMAIL_PASSWORD);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: configs.DWL_EMAIL,
                    pass: configs.EMAIL_PASSWORD,
                },
                host: 'smtp.gmail.com',
                port: 465,  // Change port here
                secure: true, // Use SSL
                connectionTimeout: 10000, // 10 seconds timeout
                logger: true,
                debug: true,
            });

            await transporter.verify();
            console.log("SMTP server is ready");

            console.log('mail');

            const mailOptions = {
                from: `DoWhileLearn <${configs.DWL_EMAIL}>`,
                to: email,
                subject: 'Email Verification',
                html: `<p>Hello Tutor,</p><p>Please use the code <strong>${otp}</strong> to verify your email address.</p>`
            };

            await transporter.sendMail(mailOptions);

        } catch (error) {
            throw new Error(`Failed to send verification email: ${(error as Error).message}`);
        }
    };
}