"use client";

interface ErosionGaugeProps {
    erosionLevel?: number; // 0-100
    isVisible?: boolean;
    galaxyName?: string;
}

export function ErosionGauge({ erosionLevel = 88, isVisible = false, galaxyName }: ErosionGaugeProps) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (erosionLevel / 100) * circumference;

    return (
        <div
            className={`fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="flex items-center gap-4 px-5 py-2 rounded-full border border-[#ff8800]/60 bg-black/20 backdrop-blur-xl shadow-[0_0_20px_rgba(255,136,0,0.15)]">

                {/* Galaxy Name */}
                {galaxyName && (
                    <div className="flex items-center border-r border-[#ff8800]/30 pr-4">
                        <span
                            className="text-xs font-bold tracking-[0.2em] text-[#ff8800]"
                            style={{ textShadow: "0 0 10px rgba(255,136,0,0.5)" }}
                        >
                            {galaxyName}
                        </span>
                    </div>
                )}

                {/* Erosion Label */}
                <span
                    className="text-[10px] tracking-widest font-bold opacity-70"
                    style={{ color: "#ff8800" }}
                >
                    EROSION LEVEL
                </span>

                {/* Value */}
                <div className="flex items-baseline gap-1 mr-1">
                    <span
                        className="text-xl font-bold tracking-tighter"
                        style={{
                            color: "#ff8800",
                            textShadow: "0 0 10px rgba(255,136,0,0.6)",
                        }}
                    >
                        {erosionLevel}
                    </span>
                    <span
                        className="text-xs font-bold opacity-80"
                        style={{ color: "#ff8800" }}
                    >
                        %
                    </span>
                </div>

                {/* Mini Circular Gauge */}
                <div className="relative w-6 h-6">
                    <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 44 44"
                    >
                        {/* Background circle */}
                        <circle
                            cx="22"
                            cy="22"
                            r={radius}
                            fill="transparent"
                            stroke="#ff8800"
                            strokeWidth="4"
                            strokeOpacity="0.2"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="22"
                            cy="22"
                            r={radius}
                            fill="transparent"
                            stroke="#ff8800"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                filter: "drop-shadow(0 0 2px #ff8800)",
                                transition: "stroke-dashoffset 0.5s ease-out",
                            }}
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
