"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export function SystemIdentity() {
    const { user, displayId } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    // Determine what to show
    const idDisplay = displayId || (user ? user.id.slice(0, 8).toUpperCase() : "GUEST");

    return (
        <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <div className="font-mono text-[10px] tracking-widest text-white opacity-40">
                UID // {idDisplay}
            </div>
        </div>
    );
}
