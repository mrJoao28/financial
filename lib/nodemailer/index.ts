import nodemailer from "nodemailer"
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD,
    }
})

export const sendWelcomeEmail = async ({email , name , intro}:WelcomeEmailData)=>{
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{intro}}',intro)
        .replace('{{name}}',name);

    const mailOptions = {
        from: "Financial ",
        to:email ,
        subject: `Welcome to Financial - `,
        text:"Thanks",
        html:htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}