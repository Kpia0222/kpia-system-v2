"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export function SystemIdentity() {
    const { user, displayId } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const idDisplay = displayId || (user ? user.id.slice(0, 8).toUpperCase() : "GUEST");

    return (
        <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <div className="px-4 py-2 bg-black/70 backdrop-blur-md border border-white/20 rounded-sm">
                <div className="font-mono text-base font-bold tracking-[0.2em] text-white opacity-80">
                    UID // <span className="text-[#ff8800]">{idDisplay}</span>
                </div>
            </div>
        </div>
    );
}
