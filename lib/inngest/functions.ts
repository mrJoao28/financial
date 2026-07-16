import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import {sendWelcomeEmail} from "@/lib/nodemailer";

export const sendSignUpEmail = inngest.createFunction(
    {
        id: "Sign-up-email",
        triggers: [{ event: "app/user.created" }],
    },
    async ({ event, step }) => {

        const userProfile = `Country: ${event.data.country}
Investment Goals: ${event.data.investmentGoals}
Risk Tolerance: ${event.data.riskTolerance}
Preferred Industry: ${event.data.preferredIndustry}`;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);


        let introText = "Thanks for joining Financial";

        try {
            const response = await step.ai.infer("generate-welcome-intro", {
                model: step.ai.models.gemini({
                    model: "gemini-2.5-flash-lite",
                    apiKey: process.env.GEMINI_API_KEY,
                }),
                body: {
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }]
                }
            });

            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part && "text" in part && part.text) {
                introText = part.text;
            }
        } catch (error) {

            console.error("Falha ao gerar texto com IA, usando fallback:", error);
        }

        await step.run("send-welcome-email", async () => {
            const {data:{email , name}} = event;
            return await sendWelcomeEmail(({email , name , intro:introText}))

        });
        return {
            sucess:true,
            message:"welcome email sent"
        }
    }
);

export default sendSignUpEmail;