"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export function SystemIdentity() {
    const { user } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <div className="font-mono text-[10px] tracking-tighter text-white opacity-40">
                UID // {user ? user.id : "GUEST_ACCESS"}
            </div>
        </div>
    );
}
