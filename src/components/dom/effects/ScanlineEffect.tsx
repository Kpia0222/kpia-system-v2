"use client";

import { useEffect } from "react";

export function ScanlineEffect() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
            style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))",
                backgroundSize: "100% 3px, 3px 100%",
                mixBlendMode: "multiply", // Darkens the screen underneath
            }}
        >
            <div className="absolute inset-0 scanline-anim" />
            <style jsx global>{`
                .scanline-anim {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                    animation: scanlineScroll 1s linear infinite;
                    opacity: 0.1;
                }
                @keyframes scanlineScroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(4px); }
                }
            `}</style>
        </div>
    );
}
