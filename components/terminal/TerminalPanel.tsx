import { cn } from "@/lib/utils";

type TerminalPanelProps = {
    code: string; // Bloomberg-style function mnemonic, e.g. "WEI"
    title: string;
    right?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    children: React.ReactNode;
};

export default function TerminalPanel({
    code,
    title,
    right,
    className,
    bodyClassName,
    children,
}: TerminalPanelProps) {
    return (
        <section className={cn("tpanel", className)}>
            <header className="tpanel-head">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="tpanel-code">{code}</span>
                    <h3 className="tpanel-title truncate">{title}</h3>
                </div>
                {right && <div className="text-xs text-gray-500 font-mono shrink-0">{right}</div>}
            </header>
            <div className={cn("tpanel-body", bodyClassName)}>{children}</div>
        </section>
    );
}
