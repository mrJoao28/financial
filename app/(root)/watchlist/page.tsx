import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getWatchlistWithData } from "@/lib/actions/watchlist.actions";
import { getAlertsByEmail } from "@/lib/actions/alert.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import WatchlistTable from "@/components/WatchlistTable";
import AlertsPanel from "@/components/AlertsPanel";

export default async function WatchlistPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userEmail = session?.user?.email ?? "";

    const rows = userEmail ? await getWatchlistWithData(userEmail) : [];
    const symbols = rows.map((r) => r.symbol);

    const [alerts, news] = await Promise.all([
        userEmail ? getAlertsByEmail(userEmail) : Promise.resolve([]),
        getNews(symbols),
    ]);

    return (
        <div className="container home-wrapper">
            <h1 className="watchlist-title">Watchlist</h1>

            <div className="watchlist-container">
                <div className="watchlist">
                    <WatchlistTable rows={rows} userEmail={userEmail} />
                </div>
                <AlertsPanel alerts={alerts} userEmail={userEmail} watchlist={rows} />
            </div>

            <div className="watchlist-news">
                {news.map((article) => (

                    <a key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-item"
                    >
                    <span className="news-tag">{article.category}</span>
                    <h3 className="news-title">{article.headline}</h3>
            <p className="news-meta">{article.source}</p>
            <p className="news-summary">{article.summary}</p>
            <span className="news-cta">Read More →</span>
        </a>
    ))}
</div>
</div>
);
}
