"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface GalaxyEntryCutInProps {
    galaxyName: string;
    onComplete: () => void;
}

export function GalaxyEntryCutIn({ galaxyName, onComplete }: GalaxyEntryCutInProps) {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Text glitch/reveal delay
        const timer = setTimeout(() => setShowText(true), 400);
        // Completion timer (2.5 seconds total)
        const completeTimer = setTimeout(onComplete, 2500);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black pointer-events-none overflow-hidden"
        >
            {/* Background Grid - Glitch Shake */}
            <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#ff8800 1px, transparent 1px), linear-gradient(90deg, #ff8800 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
                animate={{
                    x: [0, -5, 5, -2, 2, 0],
                    y: [0, 2, -2, 1, -1, 0],
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            />

            {/* Letterbox Bars */}
            <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="absolute top-0 left-0 w-full h-[12vh] bg-black z-50 border-b border-[#ff8800]/20"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="absolute bottom-0 left-0 w-full h-[12vh] bg-black z-50 border-t border-[#ff8800]/20"
            />

            {/* Left Galaxy Visual - Sliding In */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "-20%" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[80vh] h-[80vh] opacity-30"
            >
                <div
                    className="w-full h-full rounded-full border-[20px] border-[#ff8800] border-r-transparent border-b-transparent rotate-45"
                    style={{ filter: "drop-shadow(0 0 20px #ff8800)" }}
                />
            </motion.div>

            {/* Data Lines extending from left */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "circOut" }}
                className="absolute left-0 top-1/2 w-full h-[2px] bg-[#ff8800] origin-left opacity-50"
            />
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
                className="absolute left-0 top-[48%] w-3/4 h-[1px] bg-[#ff8800] origin-left opacity-30"
            />
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "circOut" }}
                className="absolute left-0 top-[52%] w-3/4 h-[1px] bg-[#ff8800] origin-left opacity-30"
            />

            {/* Central Title Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">

                {/* Micro Data overlaying title - Warning Colors */}
                <div className="absolute w-full max-w-4xl h-48 pointer-events-none flex flex-col justify-between py-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] font-mono tracking-widest text-[#ff8800] opacity-60 ml-8"
                    >
                        SIGNAL DETECTED...
                    </motion.div>

                    {/* Random Warning Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 1, 0] }}
                        transition={{ delay: 0.8, duration: 0.2, repeat: 2, repeatType: "reverse" }}
                        className="absolute top-1/3 left-1/4 text-[12px] font-mono font-bold tracking-widest text-[#ff0000]"
                        style={{ textShadow: "0 0 4px #ff0000" }}
                    >
                        unauthorized_access
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="self-end text-[10px] font-mono tracking-widest text-[#ff8800] opacity-60 mr-8"
                    >
                        COORDINATES LOCKED
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-1/3 right-1/4 text-[10px] font-mono tracking-widest text-[#ff0000] opacity-80"
                    >
                        RESTORATION FAILED
                    </motion.div>
                </div>

                {/* Main Title with Scan Line Reveal */}
                {showText && (
                    <div className="relative z-10 overflow-hidden py-4">
                        <motion.h1
                            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                            transition={{ duration: 0.6, ease: "linear" }}
                            className="text-6xl md:text-8xl font-black tracking-widest text-[#ff8800] uppercase text-center relative"
                            style={{
                                maskImage: "repeating-linear-gradient(black, black 3px, transparent 3px, transparent 4px)",
                                WebkitMaskImage: "repeating-linear-gradient(black, black 3px, transparent 3px, transparent 4px)",
                                textShadow: "0 0 20px rgba(255,136,0,0.5), 2px 2px 0px rgba(255,0,0,0.7), -2px -2px 0px rgba(0,255,255,0.7)"
                            }}
                        >
                            {galaxyName}
                        </motion.h1>

                        {/* Scan Line moving down */}
                        <motion.div
                            initial={{ top: 0 }}
                            animate={{ top: "100%" }}
                            transition={{ duration: 0.6, ease: "linear" }}
                            className="absolute left-0 w-full h-[2px] bg-white opacity-80 shadow-[0_0_10px_white]"
                        />
                    </div>
                )}

                {/* Blinking System Status - Glitchy */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1, 0.5, 1, 0] }}
                    transition={{ delay: 1.0, duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                    className="mt-8 font-mono text-sm tracking-[0.5em] text-[#ff8800]"
                >
                    SYSTEM TRANSIT_
                </motion.div>
            </div>

        </motion.div>
    );
}
