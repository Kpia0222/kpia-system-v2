"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSystemGreeting } from "@/utils/time";
import { AnalogClock } from "./AnalogClock";

/**
 * SystemInfoPanel - Left-side HUD panel with Clock, Greeting, and UID
 * Layout: Clock (top) -> Greeting (middle) -> UID (bottom)
 */
export function SystemInfoPanel() {
    const { user, displayId } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    const [greeting, setGreeting] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        setIsMounted(true);
        setGreeting(getSystemGreeting());

        // Update greeting every minute
        const greetingInterval = setInterval(() => {
            setGreeting(getSystemGreeting());
        }, 60000);

        // Update digital clock every second
        const clockInterval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        // Initial time set
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        return () => {
            clearInterval(greetingInterval);
            clearInterval(clockInterval);
        };
    }, []);

    if (!isMounted) return null;

    const idDisplay = displayId || (user ? user.id.slice(0, 8).toUpperCase() : "GUEST");

    return (
        <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-start gap-3"
            >
                {/* Clock Section */}
                <div className="flex items-center gap-3">
                    <AnalogClock size={40} />
                    <div className="flex flex-col items-start">
                        <div className="font-mono text-sm font-bold tracking-[0.15em] text-white/90">
                            {currentTime}
                        </div>
                        <div className="h-[1px] w-full bg-[#ff8800]/30 mt-0.5" />
                    </div>
                </div>

                {/* Greeting Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="font-mono text-xs tracking-[0.2em] text-[#ff8800]/80"
                >
                    {greeting}
                </motion.div>

                {/* UID Section */}
                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 rounded-sm">
                    <div className="font-mono text-sm font-bold tracking-[0.15em] text-white/80">
                        UID // <span className="text-[#ff8800]">{idDisplay}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
