import nodemailer from "nodemailer"
import {NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

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

export const sendNewsSummaryEmail = async ({
                                               email,
                                               date,
                                               newsContent,
                                           }: {
    email: string;
    date: string;
    newsContent: string;
}) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace("{{date}}", date)
        .replace("{{newsContent}}", newsContent);

    const mailOptions = {
        from: `"Financial News" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `📈 Resumo diário do mercado — ${date}`,
        text: `Resumo diário do mercado (${date})`,
        html: htmlTemplate,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`sendNewsSummaryEmail: falha ao enviar para ${email}`, error);
        throw error;
    }
};