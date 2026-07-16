"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAlert } from "@/lib/actions/alert.actions";
import CreateAlertDialog from "@/components/CreateAlertDialog";

type AlertRow = {
    _id: string;
    symbol: string;
    company: string;
    condition: "greater" | "less";
    threshold: number;
    frequency: string;
};

type AlertsPanelProps = {
    alerts: AlertRow[];
    userEmail: string;
    watchlist: { symbol: string; company: string }[];
};

export default function AlertsPanel({ alerts, userEmail, watchlist }: AlertsPanelProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const result = await deleteAlert(userEmail, id);
            if (result.success) router.refresh();
        });
    };

    return (
        <div className="watchlist-alerts">
            <div className="flex items-center justify-between w-full">
                <h2 className="watchlist-title">Alerts</h2>
                <CreateAlertDialog
                    userEmail={userEmail}
                    watchlist={watchlist}
                    trigger={<button className="yellow-btn px-4">Create Alert</button>}
                />
            </div>

            <div className="alert-list">
                {alerts.length === 0 && (
                    <p className="alert-empty">No alerts yet — create one to get notified.</p>
                )}

                {alerts.map((alert) => (
                    <div key={alert._id} className="alert-item">
                        <div className="alert-details">
                            <div>
                                <p className="alert-name">{alert.symbol}</p>
                                <p className="alert-company">{alert.company}</p>
                            </div>
                        </div>
                        <div className="alert-actions">
                            <p className="alert-price">
                                Alert: Price {alert.condition === "greater" ? ">" : "<"} $
                                {alert.threshold.toFixed(2)}
                            </p>
                            <button
                                onClick={() => handleDelete(alert._id)}
                                disabled={isPending}
                                className="alert-delete-btn"
                            >
                                <Trash2 className="trash-icon" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}