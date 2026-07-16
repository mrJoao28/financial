import { inngest } from "@/lib/inngest/client";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews, type MarketNewsArticle } from "@/lib/actions/finnhub.actions";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import { getFormattedTodayDate } from "@/lib/utils";
import {sendNewsSummaryEmail, sendWelcomeEmail} from "@/lib/nodemailer";
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


type NewsEmailUser = Awaited<ReturnType<typeof getAllUsersForNewsEmail>>[number];



export const sendDailyNewsSummary = inngest.createFunction(
    {
        id: "send-daily-news-summary",
        triggers: [{ cron: "0 12 * * *" }, { event: "app/send.daily.news" }],
    },
    async ({ step }) => {
        // Step 1: get all users eligible for the daily news email.
        const users: NewsEmailUser[] = await step.run("get-all-users", async () => {
            return await getAllUsersForNewsEmail();
        });

        if (!users || users.length === 0) {
            return { success: true };
        }

        // Step 2: for each user, resolve their watchlist symbols and fetch
        // news for them — falling back to general market news when the
        // user has no watchlist.
        const userNews = await step.run("fetch-user-news", async () => {
            const results: { email: string; news: MarketNewsArticle[] }[] = [];

            for (const user of users) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    const news =
                        symbols.length > 0 ? await getNews(symbols) : await getNews();

                    results.push({ email: user.email, news });
                } catch (err) {
                    console.error(
                        `sendDailyNewsSummary: failed to fetch news for ${user.email}`,
                        err
                    );
                    results.push({ email: user.email, news: [] });
                }
            }

            return results;
        });

        // Step 3: summarize each user's news via AI, using the NEWS_SUMMARY_EMAIL_PROMPT
        // (produces the HTML that slots into NEWS_SUMMARY_EMAIL_TEMPLATE's {{newsContent}}).
        // Each step.ai.infer call is itself a step, so this loop stays at the handler's
        // top level rather than nested inside a step.run — Inngest steps can't be nested.
        const summaries: { email: string; newsContent: string }[] = [];

        for (let i = 0; i < userNews.length; i++) {
            const entry = userNews[i];

            if (entry.news.length === 0) {
                summaries.push({ email: entry.email, newsContent: "" });
                continue;
            }

            const newsData = JSON.stringify(
                entry.news.map((article) => ({
                    headline: article.headline,
                    summary: article.summary,
                    source: article.source,
                    url: article.url,
                }))
            );

            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
                "{{newsData}}",
                newsData
            );


            const response = await step.ai.infer(`summarize-news-${i}`, {
                model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite-preview-06-17" }),
                body: {
                    contents: [{ role: "user", parts: [{text:prompt}] }],
                },
            });

           const part = response.candidates?.[0]?.content?.parts?.[0];
            const newsContent = (part && "text" in part ? part.text:null ) || "No market news";
            summaries.push({
                email: entry.email,
                newsContent: typeof newsContent === "string" ? newsContent : "",
            });
        }

        // Step 4: send the summary emails via Nodemailer.
        await step.run("send-news-emails", async () => {
            const date = getFormattedTodayDate();

            for (const entry of summaries) {
                if (!entry.newsContent) {
                    console.log(`Skipping ${entry.email} — no news to summarize.`);
                    continue;
                }

                try {
                    await sendNewsSummaryEmail({
                        email: entry.email,
                        date,
                        newsContent: entry.newsContent,
                    });
                } catch (err) {
                    console.error(
                        `sendDailyNewsSummary: failed to send email to ${entry.email}`,
                        err
                    );
                }
            }

            return { success: true };
        });

        return { success: true };
    }
);