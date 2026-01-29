import { HTMLAttributes } from "react";
import { UI_COLORS } from "@/config/system-settings";

interface CyberPanelProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    noPadding?: boolean;
}

export function CyberPanel({
    children,
    className = "",
    title,
    noPadding = false,
    ...props
}: CyberPanelProps) {
    return (
        <div
            className={`
                relative backdrop-blur-md border 
                ${noPadding ? '' : 'p-6'} 
                ${className}
            `}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: `${UI_COLORS.primary}4D`, // 30% alpha approx
            }}
            {...props}
        >
            {/* Header / Title Bar */}
            {title && (
                <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: `${UI_COLORS.primary}33` }}>
                    <h2 className="font-mono text-lg font-bold tracking-widest" style={{ color: UI_COLORS.primary }}>
                        {title}
                    </h2>
                    <div className="w-2 h-2 animate-pulse" style={{ backgroundColor: UI_COLORS.primary }} />
                </div>
            )}

            {/* Content */}
            {children}

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: UI_COLORS.primary }} />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: UI_COLORS.primary }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: UI_COLORS.primary }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: UI_COLORS.primary }} />
        </div>
    );
}
