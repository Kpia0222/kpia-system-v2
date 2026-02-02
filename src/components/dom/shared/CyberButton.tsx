import { ButtonHTMLAttributes } from "react";
import { UI_COLORS } from "@/config/system-settings";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export function CyberButton({
    children,
    className = "",
    variant = 'primary',
    isLoading = false,
    disabled,
    ...props
}: CyberButtonProps) {
    const baseColor = variant === 'primary' ? UI_COLORS.primary :
        variant === 'danger' ? '#ff0000' : UI_COLORS.secondary;

    return (
        <button
            disabled={disabled || isLoading}
            className={`
                relative px-6 py-2 font-mono text-sm font-bold tracking-widest transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                group
                ${className}
            `}
            style={{
                color: variant === 'primary' ? 'black' : baseColor,
                backgroundColor: variant === 'primary' ? baseColor : 'transparent',
                border: `1px solid ${baseColor}`,
            }}
            {...props}
        >
            {/* Hover Glitch Effect Overlay */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading && <span className="animate-spin text-xs">⏳</span>}
                {children}
            </span>
        </button>
    );
}
