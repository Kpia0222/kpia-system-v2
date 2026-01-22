"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface StartScreenProps {
    onStartSystem: () => void;
    isTransitioning?: boolean;
}

export function StartScreen({ onStartSystem, isTransitioning = false }: StartScreenProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const fullText = "ORGANIC HYPER AETHER";
    const [isTypingComplete, setIsTypingComplete] = useState(false);

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

            {/* Decorative Lines & Squares - Glows during transition */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isTransitioning ? 0.9 : 0.2 }}
                transition={{ duration: 0.5 }}
            >
                {/* Thin Lines */}
                <div className="absolute top-[20%] left-0 w-full h-[1px] bg-white/10" />
                <div className="absolute top-[80%] left-0 w-full h-[1px] bg-white/10" />
                {/* Vertical Ruler - 12th Root of 2 Scale */}
                <div className="absolute top-0 left-[15%] w-[1px] h-full bg-white/10">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const val = Math.pow(2, (i + 1) / 12);
                        const pos = (val - 1) * 100; // Map 1.0-2.0 to 0-100%
                        return (
                            <div key={i} className="absolute w-[6px] h-[1px] bg-white/30 -left-[3px]" style={{ top: `${pos}%` }}>
                                <span className="absolute left-2 -top-1 text-[8px] font-mono text-white/30 tracking-widest opacity-70">
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
                onClick={onStartSystem}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative z-10 flex flex-col items-center py-4 cursor-pointer"
            >
                <div className={`flex items-center font-mono text-xl font-bold tracking-[0.3em] transition-colors duration-300 ${isHovered ? 'text-[#ff8800]' : 'text-white'}`}>
                    START SYSTEM
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block ml-4 w-3 h-6 bg-[#ff8800]"
                    />
                </div>

                {/* Underline */}
                <div className={`mt-2 w-full h-[1px] bg-gradient-to-r from-transparent ${isHovered ? 'via-[#ff8800]' : 'via-white/50'} to-transparent transition-colors duration-300`} />
            </motion.button>

            <div className="absolute bottom-10 text-xs text-white/30 font-mono tracking-widest">
                KPIA SYSTEM INITIALIZED
            </div>
        </div >
    );
}
