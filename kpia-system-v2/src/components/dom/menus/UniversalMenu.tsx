"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { MENU_LABELS, UI_STRINGS } from "@/config/ui-strings";
import { createClient } from "@/lib/supabase/client";

// UniversalMenu now uses Zustand directly - no props required
export function UniversalMenu() {
    const {
        isMenuOpen,
        closeMenu,
        openMenu,
        setCurrentScene,
        setDiving,
        currentScene,
        user,
        setUser,
        setSession,
    } = useStore();

    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        closeMenu('menu');
    };

    const handleAuthClick = () => {
        closeMenu('menu'); // Close main menu to focus on auth
        openMenu('auth');
    };

    // ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isMenuOpen && e.key === "Escape") {
                closeMenu('menu');
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMenuOpen, closeMenu]);

    const handleStartScreenClick = () => {
        // Trigger dive animation
        setDiving(true);
        closeMenu('menu');

        // Wait for dive animation, then switch scene
        setTimeout(() => {
            setCurrentScene('start');
            setDiving(false);
        }, 1500);
    };

    const handleClose = () => closeMenu('menu');

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl pointer-events-auto"
                    onClick={handleClose}
                >
                    {/* Scanline Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                    {/* Menu Container */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-96 flex flex-col gap-1 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Decoration */}
                        <div className="flex items-center justify-between mb-4 border-b border-[#ff8800]/50 pb-2">
                            <span className="text-[#ff8800] font-mono text-xs tracking-[0.2em] font-bold">
                                {MENU_LABELS.UNIVERSAL_MENU_TITLE}
                            </span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-[#ff8800] animate-pulse" />
                                <div className="w-2 h-2 bg-[#ff8800]/30" />
                            </div>
                        </div>

                        {/* Menu Items */}
                        <MenuItem label={MENU_LABELS.ITEMS.START_SCREEN} onClick={handleStartScreenClick} />
                        <MenuItem label={MENU_LABELS.ITEMS.AUDIO_SETTINGS} onClick={() => console.log("Audio Settings")} />

                        {/* Auth Item */}
                        {user ? (
                            <MenuItem
                                label={`LOGOUT [${user.email?.slice(0, 8)}...]`}
                                onClick={handleLogout}
                                className="border-[#ff8800]/50"
                            />
                        ) : (
                            <MenuItem
                                label="LOGIN / SYNC"
                                onClick={handleAuthClick}
                                className="border-[#ff8800]/50"
                            />
                        )}

                        {/* Disabled Item */}
                        <div className="group relative overflow-hidden bg-white/5 border border-white/10 p-4 mt-2 opacity-50 cursor-not-allowed">
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-sm tracking-widest text-white/50">
                                    {UI_STRINGS.STATUS.COMING_SOON}
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">{UI_STRINGS.STATUS.LOCKED}</span>
                            </div>
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)] pointer-events-none" />
                        </div>

                        {/* Footer Info */}
                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-[#ff8800]/50 font-mono tracking-widest">
                                {UI_STRINGS.STATUS.VERSION_SYSTEM}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function MenuItem({ label, onClick, className = "" }: { label: string; onClick?: () => void; className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`group relative w-full text-left p-4 overflow-hidden border border-white/10 hover:border-[#ff8800]/50 bg-black/40 hover:bg-[#ff8800]/10 transition-all duration-300 ${className}`}
        >
            <div className="relative z-10 flex justify-between items-center">
                <span className="font-mono text-sm font-bold tracking-widest text-white group-hover:text-[#ff8800] transition-colors">
                    {label}
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-[#ff8800] transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    &lt;&lt;
                </span>
            </div>

            {/* Slide hover effect */}
            <div className="absolute top-0 left-0 h-full w-1 bg-[#ff8800] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        </button>
    )
}
