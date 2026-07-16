"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { searchStocks, type StockSearchResult } from "@/lib/actions/finnhub.actions";

type SearchCommandProps = {
    open?: boolean;
    setOpen?: (open: boolean) => void;
};

const POPULAR_STOCKS = ["AAPL", "TSLA", "NVDA"];

export default function SearchCommand({ open: openProp, setOpen: setOpenProp }: SearchCommandProps) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<StockSearchResult[]>([]);

    const open = openProp !== undefined ? openProp : internalOpen;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setInternalOpen;

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(!open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, setOpen]);

    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const data = await searchStocks(searchTerm);
                setResults(data);
            } catch (err) {
                console.error("Erro ao buscar ações:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleSelectStock = (symbol: string) => {
        setOpen(false);
        setSearchTerm("");
        setResults([]);
        router.push(`/stocks/${symbol}`);
    };

    const isSearching = searchTerm.trim().length > 0;
    const displayList = isSearching ? results : POPULAR_STOCKS.map((s) => ({ symbol: s, description: s }));

    return (
        <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
            <div className="search-field">
                <CommandInput
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    className="search-input"
                />
                {loading && <Loader2 className="search-loader" />}
            </div>
            <CommandList className="search-list">
                {!loading && isSearching && results.length === 0 && (
                    <CommandEmpty className="search-list-empty">No results found.</CommandEmpty>
                )}
                {!loading && displayList.length > 0 && (
                    <CommandGroup heading={isSearching ? "Results" : "Suggestions"}>
                        {!isSearching && <p className="search-count">Popular stocks</p>}
                        {displayList.map((item) => (
                            <CommandItem
                                key={item.symbol}
                                value={item.symbol}
                                onSelect={() => handleSelectStock(item.symbol)}
                                className="search-item"
                            >
                                <div className="search-item-link">
                  <span className="search-item-name">
                    {item.symbol}
                      {"description" in item && item.description !== item.symbol && (
                          <span className="text-gray-500 font-normal ml-2">{item.description}</span>
                      )}
                  </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}