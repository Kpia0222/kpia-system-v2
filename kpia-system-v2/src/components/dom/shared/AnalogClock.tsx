"use client";

import { useEffect, useRef } from "react";
import { CLOCK_SETTINGS, UI_COLORS } from "@/config/system-settings";

interface AnalogClockProps {
    className?: string;
    size?: number;
}

export function AnalogClock({ className = "", size = CLOCK_SETTINGS.size }: AnalogClockProps) {
    const hourHand = useRef<SVGLineElement>(null);
    const minuteHand = useRef<SVGLineElement>(null);
    const secondHand = useRef<SVGLineElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = now.getHours() % 12;
            const m = now.getMinutes();
            const s = now.getSeconds();
            const ms = now.getMilliseconds();

            // Smooth angles
            const sAngle = (s + ms / 1000) * 6;
            const mAngle = (m + s / 60) * 6;
            const hAngle = (h + m / 60) * 30;

            if (secondHand.current) {
                secondHand.current.style.transform = `rotate(${sAngle}deg)`;
            }
            if (minuteHand.current) {
                minuteHand.current.style.transform = `rotate(${mAngle}deg)`;
            }
            if (hourHand.current) {
                hourHand.current.style.transform = `rotate(${hAngle}deg)`;
            }

            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // Center point
    const cx = 50;
    const cy = 50;
    const radius = 48; // leaving some padding

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
        >
            {/* Outer Ring */}
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={UI_COLORS.border}
                strokeWidth={CLOCK_SETTINGS.strokeWidth.frame}
            />

            {/* Tick Marks (4 cardinal directions) */}
            {[0, 90, 180, 270].map((deg) => (
                <line
                    key={deg}
                    x1={cx}
                    y1={cy - radius}
                    x2={cx}
                    y2={cy - radius + 5}
                    stroke={UI_COLORS.border}
                    strokeWidth={CLOCK_SETTINGS.strokeWidth.tick}
                    transform={`rotate(${deg} ${cx} ${cy})`}
                />
            ))}

            {/* Hands - Initial position 12 o'clock (vertical up is -90deg or handled by CSS transform-origin)
                SVG rotation 0 is usually 3 o'clock if using Math, but CSS rotate(0deg) typically depends.
                Usually SVG coords: 0deg is along +X axis (3 o'clock).
                But here we can draw them pointing UP (12 o'clock) and just rotate.
                
                Actually easiest: Draw lines from center to top. Rotate around center.
            */}

            {/* Hour Hand */}
            <line
                ref={hourHand}
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - (radius * CLOCK_SETTINGS.handLength.hour)}
                stroke={UI_COLORS.text.secondary}
                strokeWidth={CLOCK_SETTINGS.strokeWidth.hour}
                strokeLinecap="round"
                className="origin-center"
            />

            {/* Minute Hand */}
            <line
                ref={minuteHand}
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - (radius * CLOCK_SETTINGS.handLength.minute)}
                stroke={UI_COLORS.text.primary}
                strokeWidth={CLOCK_SETTINGS.strokeWidth.minute}
                strokeLinecap="round"
                className="origin-center"
            />

            {/* Second Hand */}
            <line
                ref={secondHand}
                x1={cx}
                y1={cy + 8} // little tail
                x2={cx}
                y2={cy - (radius * CLOCK_SETTINGS.handLength.second)}
                stroke={UI_COLORS.primary}
                strokeWidth={CLOCK_SETTINGS.strokeWidth.second}
                strokeLinecap="round"
                className="origin-center"
            />

            {/* Center Cap */}
            <circle
                cx={cx}
                cy={cy}
                r={2}
                fill={UI_COLORS.background}
                stroke={UI_COLORS.primary}
                strokeWidth={1}
            />
        </svg>
    );
}
