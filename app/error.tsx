'use client';

import Link from "next/link";

export default function ErrorPage({ error, unstable_retry }: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center text-gray-200">
            <h1 className="text-2xl font-semibold">We couldn’t load this page</h1>
            <p className="text-gray-400">A service is temporarily unavailable. Please try again shortly.</p>
            <button className="yellow-btn rounded-md px-6 py-3" onClick={unstable_retry}>Try again</button>
            <Link className="underline" href="/sign-in">Back to sign in</Link>
            {error.digest && <p className="text-xs text-gray-500">Reference: {error.digest}</p>}
        </main>
    );
}
