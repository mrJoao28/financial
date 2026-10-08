import { ExternalLink } from 'lucide-react';
import { DAY_TRADE_LIVE_EMBED_URL, DAY_TRADE_LIVE_WATCH_URL } from '@/lib/market-data';

export default function LiveStreamPanel() {
    return (
        <div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600">
                <p className="font-mono text-sm flex items-center gap-2">
                    <span className="text-gray-500">STATUS:</span>
                    <span className="flex items-center gap-2 text-red-500 font-semibold">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        </span>
                        AO VIVO
                    </span>
                </p>
                <a
                    href={DAY_TRADE_LIVE_WATCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-yellow-500 transition-colors"
                >
                    Abrir no YouTube <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>

            <div className="relative aspect-video w-full bg-gray-900">
                <iframe
                    src={DAY_TRADE_LIVE_EMBED_URL}
                    title="Live: análise de mercado ao vivo"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </div>
    );
}
