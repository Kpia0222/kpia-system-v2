"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { UI_STRINGS } from "@/config/ui-strings";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase/client";

interface StartScreenProps {
    onStartSystem: () => void;
    isTransitioning?: boolean;
}

export function StartScreen({ onStartSystem, isTransitioning = false }: StartScreenProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const fullText = UI_STRINGS.TITLE.MAIN;
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [authNotification, setAuthNotification] = useState<string | null>(null);

    const { user, openMenu, resetState, lastPosition, executeSceneTransition, setLoading } = useStore();
    const supabase = createClient();

    // Greeting notification on login
    useEffect(() => {
        if (user?.email) {
            setAuthNotification(`AUTHENTICATION SUCCESSFUL: ${user.email.split('@')[0].toUpperCase()}`);
            const timer = setTimeout(() => setAuthNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Handle Start Logic (Resume vs New)
    const handleStart = () => {
        if (lastPosition && lastPosition.scene !== 'start') {
            // Resume from last position
            console.log("Resuming from last position:", lastPosition);
            setLoading(true, "RESUMING NEURAL LINK...");

            // Execute transition to last known state
            executeSceneTransition(lastPosition.scene, {
                targetView: lastPosition.viewMode,
                galaxyId: lastPosition.galaxyId,
                loadingText: "RESTORING QUANTUM STATE...",
                duration: 2000
            });
        } else {
            // Standard Start
            onStartSystem();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        resetState();
    };

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
                setIsTypingComplete(true);
            }
        }, 80); // Typing speed
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto select-none overflow-hidden">

            {/* Auth Notification */}
            <AnimatePresence>
                {authNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-10 right-10 z-50 flex items-center gap-3 border-l-2 border-[#00ff00] bg-black/60 backdrop-blur pl-4 pr-6 py-3"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse" />
                        <span className="font-mono text-sm text-[#00ff00] tracking-widest">{authNotification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login / Logout Button (Top Right) */}
            <div className="absolute top-8 right-8 z-[60]">
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-red-500/50 bg-black/40 backdrop-blur transition-all duration-300"
                    >
                        <div className="w-1.5 h-1.5 bg-red-500/50 group-hover:bg-red-500" />
                        <span className="font-mono text-xs text-white/60 group-hover:text-red-400 tracking-widest">LOGOUT</span>
                    </button>
                ) : (
                    <button
                        onClick={() => openMenu('auth')}
                        className="group flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-[#ff8800]/50 bg-black/40 backdrop-blur transition-all duration-300"
                    >
                        <div className="w-1.5 h-1.5 bg-[#ff8800]/50 group-hover:bg-[#ff8800]" />
                        <span className="font-mono text-xs text-white/60 group-hover:text-[#ff8800] tracking-widest">LOGIN</span>
                    </button>
                )}
            </div>

            {/* Decorative Lines & Squares - Glows during transition */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isTransitioning ? 0.9 : 0.2 }}
                transition={{ duration: 0.5 }}
            >
                {/* Thin Lines */}
                <div className="absolute top-[20%] left-0 w-full h-[1px] bg-white/20" />
                <div className="absolute top-[80%] left-0 w-full h-[1px] bg-white/20" />
                {/* Vertical Ruler - 12th Root of 2 Scale */}
                <div className="absolute top-0 left-[15%] w-[1px] h-full bg-white/20">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const val = Math.pow(2, (i + 1) / 12);
                        const pos = (val - 1) * 100; // Map 1.0-2.0 to 0-100%
                        return (
                            <div key={i} className="absolute w-[6px] h-[1px] bg-white/30 -left-[3px]" style={{ top: `${pos}%` }}>
                                <span className="absolute left-2 -top-1 text-[8px] font-mono text-white/100 tracking-widest opacity-70">
                                    {val.toFixed(5)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="absolute top-0 right-[15%] w-[1px] h-full bg-white/10" />

                {/* Random Thin Accents */}
                <div className="absolute top-[40%] left-[10%] w-[100px] h-[1px] bg-white/30" />
                <div className="absolute bottom-[30%] right-[10%] w-[150px] h-[1px] bg-white/30" />
                <div className="absolute top-[15%] right-[25%] w-[1px] h-[40px] bg-white/30" />

                {/* Small Squares */}
                <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-white" />
                <div className="absolute top-[80%] right-[15%] w-1 h-1 bg-white" />
                <div className="absolute top-[40%] right-[10%] w-[2px] h-[2px] bg-[#ff8800]" />
                <div className="absolute bottom-[30%] left-[10%] w-[2px] h-[2px] bg-[#ff8800]" />
            </motion.div>

            {/* Main Title - Typewriter Effect */}
            <div className="z-10 text-center mb-20 min-h-[100px] flex flex-col items-center justify-center">
                <h1 className="text-4xl md:text-6xl font-black font-mono tracking-[0.2em] text-white">
                    {displayText}
                </h1>
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isTypingComplete ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="mt-4 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
            </div>

            {/* Start Button - Appears after typing */}
            <motion.button
                initial={{ opacity: 0, y: 50 }}
                animate={isTypingComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 1.0 }}
                onClick={handleStart}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative z-10 flex flex-col items-center py-4 cursor-pointer"
            >
                <div className={`flex items-center font-mono text-xl font-bold tracking-[0.3em] transition-colors duration-300 ${isHovered ? 'text-[#ff8800]' : 'text-white'}`}>
                    {lastPosition && lastPosition.scene !== 'start' ? 'RESUME SYSTEM' : UI_STRINGS.ACTIONS.PRESS_START}
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block ml-4 w-3 h-6 bg-[#ff8800]"
                    />
                </div>

                {/* Underline */}
                <div className={`mt-2 w-full h-[1px] bg-gradient-to-r from-transparent ${isHovered ? 'via-[#ff8800]' : 'via-white/50'} to-transparent transition-colors duration-300`} />
            </motion.button>

            <div className="absolute bottom-10 flex flex-col items-center gap-2 text-xs text-white/30 font-mono tracking-widest">
                <span>{UI_STRINGS.STATUS.INIT_SYSTEM}</span>
            </div>
            <div className="absolute bottom-10 flex flex-col right-10 gap-2 text-xs text-white/100 font-mono tracking-widest">
                <span>{UI_STRINGS.STATUS.VERSION_BETA}</span>
            </div>
        </div >
    );
}
