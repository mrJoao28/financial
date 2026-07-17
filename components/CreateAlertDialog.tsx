"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAlert } from "@/lib/actions/alert.actions";
import { CONDITION_OPTIONS, ALERT_TYPE_OPTIONS } from "@/lib/constants";

type WatchlistOption = { symbol: string; company: string };

type CreateAlertDialogProps = {
    trigger: React.ReactNode;
    userEmail: string;
    watchlist: WatchlistOption[];
    presetSymbol?: string;
    presetCompany?: string;
};

export default function CreateAlertDialog({
                                              trigger,
                                              userEmail,
                                              watchlist,
                                              presetSymbol,
                                              presetCompany,
                                          }: CreateAlertDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [symbol, setSymbol] = useState(presetSymbol ?? "");
    const [alertType, setAlertType] = useState<"upper" | "lower">("upper");
    const [condition, setCondition] = useState<"greater" | "less">("greater");
    const [threshold, setThreshold] = useState("");

    const handleSubmit = () => {
        const company =
            presetCompany ?? watchlist.find((w) => w.symbol === symbol)?.company ?? symbol;

        if (!symbol || !threshold) return;

        startTransition(async () => {
            const result = await createAlert(userEmail, {
                symbol,
                company,
                alertType,
                condition,
                threshold: Number(threshold),
                frequency: "once_per_day",
            });

            if (result.success) {
                setOpen(false);
                setThreshold("");
                router.refresh();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="alert-dialog">
                <DialogHeader>
                    <DialogTitle className="alert-title">Create Price Alert</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    {!presetSymbol && (
                        <div className="flex flex-col gap-2">
                            <Label className="form-label">Stock</Label>
                            <Select value={symbol} onValueChange={setSymbol}>
                                <SelectTrigger className="select-trigger">
                                    <SelectValue placeholder="Select a stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    {watchlist.map((w) => (
                                        <SelectItem key={w.symbol} value={w.symbol}>
                                            {w.company} ({w.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label className="form-label">Alert Type</Label>
                        <Select value={alertType} onValueChange={(v) => setAlertType(v as "upper" | "lower")}>
                            <SelectTrigger className="select-trigger">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ALERT_TYPE_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="form-label">Condition</Label>
                        <Select value={condition} onValueChange={(v) => setCondition(v as "greater" | "less")}>
                            <SelectTrigger className="select-trigger">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CONDITION_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="form-label">Price Threshold</Label>
                        <Input
                            type="number"
                            className="form-input"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            placeholder="e.g. 240.00"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !symbol || !threshold}
                        className="yellow-btn mt-2"
                    >
                        {isPending ? "Creating..." : "Create Alert"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}