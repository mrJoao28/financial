'use client';

import usePolling from '@/hooks/usePolling';
import { getHeadlines, type Headline } from '@/lib/actions/market.actions';

const fetchHeadlines = () => getHeadlines(12, 'general');

export default function HeadlinesList({ initial }: { initial: Headline[] }) {
    const { data, failed } = usePolling(fetchHeadlines, 60_000, initial);

    if (data.length === 0) {
        return (
            <p className="px-4 py-6 text-sm text-gray-500">
                {failed ? 'Could not load headlines right now.' : 'No headlines available.'}
            </p>
        );
    }

    return (
        <ol className="divide-y divide-gray-600/40">
            {data.map((item, index) => (
                <li key={item.id}>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="font-mono text-gray-500 text-sm w-6 shrink-0">{index + 1})</span>
                        <span className="min-w-0">
                            <span className="block font-semibold uppercase text-yellow-500 group-hover:text-yellow-400 text-[15px] leading-snug">
                                {item.headline}
                            </span>
                            <span
                                className="block mt-1 font-mono text-xs text-gray-500"
                                suppressHydrationWarning
                            >
                                {new Date(item.datetime * 1000).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                {item.source ? ` · ${item.source}` : ''}
                            </span>
                        </span>
                    </a>
                </li>
            ))}
        </ol>
    );
}
