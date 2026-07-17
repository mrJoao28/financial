"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchCommand from "@/components/SearchCommand";

const NavItems = () => {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    return (
        <>
            <ul className="flex flex-col sm:flex-row p-2 gap-10 sm:gap-10 font-medium">
                {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                        {item.label === "Search" ? (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className={`hover:text-yellow-500 transition-colors ${
                                    isActive(item.href) ? "text-gray-100" : ""
                                }`}
                            >
                                {item.label}
                            </button>
                        ) : (
                            <Link
                                href={item.href}
                                className={`hover:text-yellow-500 transition-colors ${
                                    isActive(item.href) ? "text-gray-100" : ""
                                }`}
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
            <SearchCommand open={searchOpen} setOpen={setSearchOpen} />
        </>
    );
};

export default NavItems;