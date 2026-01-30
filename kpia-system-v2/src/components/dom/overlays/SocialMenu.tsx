"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/store/useStore";

// Demo explorer data with different statuses
const DEMO_EXPLORERS = [
    {
        userId: "demo-001",
        displayId: "100000042",
        username: "OBSERVER_PRIME",
        erosionLevel: 0.92,
        status: "online" as const,
        lastGalaxyId: "g-eternity",
        kardashevScale: 2.1,
    },
    {
        userId: "demo-002",
        displayId: "100000128",
        username: "VOID_WALKER",
        erosionLevel: 0.45,
        status: "online" as const,
        lastGalaxyId: "g-order",
        kardashevScale: 1.6,
    },
    {
        userId: "demo-003",
        displayId: "100000256",
        username: "STARLIGHT_NOVICE",
        erosionLevel: 0.08,
        status: "offline" as const,
        lastGalaxyId: "g-chaos",
        kardashevScale: 1.1,
    },
];

// Get erosion status label and color
const getErosionStatus = (level: number) => {
    if (level >= 0.8) return { label: "CRITICAL", color: "text-red-500", bgColor: "bg-red-500" };
    if (level >= 0.5) return { label: "MODERATE", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    return { label: "STABLE", color: "text-green-500", bgColor: "bg-green-500" };
};

// SocialMenu - F6 Collaborative Exploration Protocol Interface
export function SocialMenu() {
    const {
        isSocialOpen,
        closeMenu,
        user,
        displayId,
        generateDisplayId,
        isVisitingMode,
        enterVisitingMode,
        exitVisitingMode,
    } = useStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<typeof DEMO_EXPLORERS[0] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpTarget, setJumpTarget] = useState<string | null>(null);

    // Generate display ID on first open if missing
    useEffect(() => {
        if (isSocialOpen && user && !displayId) {
            generateDisplayId();
        }
    }, [isSocialOpen, user, displayId, generateDisplayId]);

    // Reset states on close
    useEffect(() => {
        if (!isSocialOpen) {
            setSearchQuery("");
            setSearchResult(null);
            setCopyFeedback(false);
        }
    }, [isSocialOpen]);

    const handleCopyId = useCallback(async () => {
        if (!displayId) return;
        try {
            await navigator.clipboard.writeText(displayId);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    }, [displayId]);

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.length < 8) return;

        setIsSearching(true);
        setSearchResult(null);

        // Simulate search with demo data
        setTimeout(() => {
            const found = DEMO_EXPLORERS.find(e => e.displayId === searchQuery);
            setSearchResult(found || null);
            setIsSearching(false);
        }, 800);
    };

    const handleJump = (targetUserId: string, targetDisplayId: string) => {
        setIsJumping(true);
        setJumpTarget(targetDisplayId);

        // Trigger warp animation, then close menu
        setTimeout(() => {
            enterVisitingMode(targetUserId);
            closeMenu('social');
            setIsJumping(false);
            setJumpTarget(null);
        }, 2500);
    };

    const handleClose = () => closeMenu('social');

    return (
        <>
            {/* JUMP Warp Transition Overlay */}
            <AnimatePresence>
                {isJumping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden"
                    >
                        {/* Star Streak Effect */}
                        <div className="absolute inset-0">
                            {Array.from({ length: 100 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-[2px] bg-gradient-to-b from-transparent via-white to-transparent"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        height: `${20 + Math.random() * 60}%`,
                                    }}
                                    initial={{ y: "-100%", opacity: 0 }}
                                    animate={{
                                        y: "200%",
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.8 + Math.random() * 0.5,
                                        delay: Math.random() * 0.3,
                                        ease: "linear",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Central Glow */}
                        <motion.div
                            className="absolute w-[200px] h-[200px] rounded-full bg-[#ff8800]/30 blur-[100px]"
                            animate={{
                                scale: [1, 2, 3],
                                opacity: [0.5, 0.8, 0],
                            }}
                            transition={{ duration: 2 }}
                        />

                        {/* System Log */}
                        <div className="relative z-10 text-center">
                            <motion.div
                                className="font-mono text-[#ff8800] text-sm tracking-[0.3em] mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                DIMENSIONAL JUMP INITIATED
                            </motion.div>
                            <motion.div
                                className="font-mono text-white text-xs tracking-widest"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                NAVIGATING TO TARGET GALAXY...
                            </motion.div>
                            {jumpTarget && (
                                <motion.div
                                    className="font-mono text-[#ff8800]/60 text-xs tracking-widest mt-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    TARGET: UID {jumpTarget}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Menu */}
            <AnimatePresence>
                {isSocialOpen && !isJumping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-2xl pointer-events-auto"
                        onClick={handleClose}
                    >
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                        {/* Main Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative z-10 w-[520px] max-h-[85vh] flex flex-col border border-[#ff8800]/30 bg-black/95 shadow-[0_0_50px_rgba(255,136,0,0.15)] p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col">
                                    <span className="text-[#ff8800] font-mono text-xl tracking-[0.2em] font-bold">
                                        SOCIAL PROTOCOL
                                    </span>
                                    <span className="text-[#ff8800]/50 font-mono text-xs tracking-widest mt-1">
                                        COLLABORATIVE EXPLORATION NETWORK
                                    </span>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="group relative px-4 py-1 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all duration-300"
                                >
                                    CLOSE
                                </button>
                            </div>

                            {/* My ID Section with Copy */}
                            <div className="mb-6 p-4 border border-[#ff8800]/20 bg-[#ff8800]/5 relative overflow-hidden">
                                <div className="text-[#ff8800]/60 font-mono text-xs tracking-widest mb-2">
                                    YOUR EXPLORATION ID
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCopyId}
                                        className="font-mono text-2xl text-white tracking-[0.3em] font-bold hover:text-[#ff8800] transition-colors cursor-pointer"
                                        title="Click to copy"
                                    >
                                        {displayId || "GENERATING..."}
                                    </button>
                                    <button
                                        onClick={handleCopyId}
                                        className="px-3 py-1 border border-[#ff8800]/40 text-[#ff8800] font-mono text-[10px] tracking-widest hover:bg-[#ff8800] hover:text-black transition-all"
                                    >
                                        COPY
                                    </button>
                                </div>
                                <div className="text-[#ff8800]/40 font-mono text-[10px] mt-2">
                                    Share this ID to connect with other explorers
                                </div>

                                {/* Copy Feedback */}
                                <AnimatePresence>
                                    {copyFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-black font-mono text-xs tracking-widest font-bold"
                                        >
                                            CODE COPIED
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Visiting Mode Indicator */}
                            {isVisitingMode && (
                                <div className="mb-4 p-3 border border-cyan-500/50 bg-cyan-500/10">
                                    <div className="flex justify-between items-center">
                                        <div className="font-mono text-cyan-400 text-sm tracking-widest">
                                            ⚠ VISITING MODE ACTIVE
                                        </div>
                                        <button
                                            onClick={exitVisitingMode}
                                            className="px-3 py-1 border border-cyan-500/50 text-cyan-400 font-mono text-xs hover:bg-cyan-500 hover:text-black transition-all"
                                        >
                                            EXIT
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Search Section */}
                            <div className="mb-6">
                                <div className="text-[#ff8800]/60 font-mono text-xs tracking-widest mb-2">
                                    FIND EXPLORER
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Enter 9-digit ID..."
                                        className="flex-1 bg-black border border-[#ff8800]/30 text-white font-mono text-sm px-3 py-2 placeholder:text-[#ff8800]/30 focus:border-[#ff8800] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="px-4 py-2 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all disabled:opacity-50"
                                    >
                                        {isSearching ? "..." : "SCAN"}
                                    </button>
                                </div>

                                {/* Search Result with Glow */}
                                <AnimatePresence>
                                    {searchResult && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="mt-3 p-4 border border-[#ff8800] bg-black relative overflow-hidden"
                                            style={{
                                                boxShadow: "0 0 30px rgba(255, 136, 0, 0.4), inset 0 0 20px rgba(255, 136, 0, 0.1)"
                                            }}
                                        >
                                            {/* Animated glow border */}
                                            <motion.div
                                                className="absolute inset-0 opacity-50"
                                                animate={{
                                                    boxShadow: [
                                                        "inset 0 0 20px rgba(255, 136, 0, 0.2)",
                                                        "inset 0 0 40px rgba(255, 136, 0, 0.4)",
                                                        "inset 0 0 20px rgba(255, 136, 0, 0.2)"
                                                    ]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />

                                            <div className="relative z-10 flex justify-between items-center">
                                                <div>
                                                    <div className="font-mono text-[#ff8800] text-xs tracking-widest mb-1">
                                                        EXPLORER FOUND
                                                    </div>
                                                    <div className="font-mono text-white text-lg tracking-wider">
                                                        {searchResult.username}
                                                    </div>
                                                    <div className="font-mono text-[#ff8800]/60 text-xs mt-1">
                                                        ID: {searchResult.displayId} • {getErosionStatus(searchResult.erosionLevel).label}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleJump(searchResult.userId, searchResult.displayId)}
                                                    className="px-4 py-2 bg-[#ff8800] text-black font-mono text-sm font-bold tracking-widest hover:bg-white transition-all"
                                                >
                                                    JUMP
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Demo Explorers List */}
                            <div className="flex-1 overflow-hidden">
                                <div className="text-[#ff8800]/60 font-mono text-xs tracking-widest mb-2">
                                    CO-INVESTIGATORS ({DEMO_EXPLORERS.length})
                                </div>
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                    {DEMO_EXPLORERS.map((explorer) => {
                                        const erosion = getErosionStatus(explorer.erosionLevel);
                                        return (
                                            <div
                                                key={explorer.userId}
                                                className="flex justify-between items-center p-3 border border-[#ff8800]/20 bg-black/50 hover:border-[#ff8800]/50 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${explorer.status === "online"
                                                                ? "bg-green-500 animate-pulse"
                                                                : "bg-gray-500"
                                                            }`}
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-white text-sm tracking-wider">
                                                                {explorer.username}
                                                            </span>
                                                            <span className={`font-mono text-[9px] ${erosion.color}`}>
                                                                [{erosion.label}]
                                                            </span>
                                                        </div>
                                                        <div className="font-mono text-[#ff8800]/50 text-[10px] flex gap-3">
                                                            <span>ID: {explorer.displayId}</span>
                                                            <span>K: {explorer.kardashevScale.toFixed(1)}</span>
                                                            <span>E: {(explorer.erosionLevel * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleJump(explorer.userId, explorer.displayId)}
                                                    className="px-4 py-1 border border-[#ff8800] text-[#ff8800] font-mono text-xs tracking-widest hover:bg-[#ff8800] hover:text-black transition-all opacity-70 group-hover:opacity-100"
                                                >
                                                    JUMP
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-[#ff8800]/20 flex justify-between items-center">
                                <div className="font-mono text-[#ff8800]/30 text-[10px]">
                                    PRESS [F6] TO CLOSE
                                </div>
                                <div className="font-mono text-[#ff8800]/30 text-[10px]">
                                    v0.2.0 ENHANCED
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
