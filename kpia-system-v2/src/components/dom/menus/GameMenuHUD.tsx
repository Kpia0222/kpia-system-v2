"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { MENU_LABELS, UI_STRINGS } from "@/config/ui-strings";
import { MAIN_MENU_BUTTONS, SEPARATED_MENU_BUTTON, getMenuLabel } from "@/config/menu-config";

interface MenuButton {
    id: string;
    label: string;
    shortcut: string;
}

// Build main buttons from config (left-to-right order)
const buildMainButtons = (currentScene: 'start' | 'universe' | 'my_galaxy'): MenuButton[] => {
    return MAIN_MENU_BUTTONS.map(config => ({
        id: config.id,
        label: getMenuLabel(config, currentScene),
        shortcut: config.shortcut,
    }));
};

// Build separated MENU button
const buildMenuButton = (currentScene: 'start' | 'universe' | 'my_galaxy'): MenuButton => ({
    id: SEPARATED_MENU_BUTTON.id,
    label: getMenuLabel(SEPARATED_MENU_BUTTON, currentScene),
    shortcut: SEPARATED_MENU_BUTTON.shortcut,
});

// SVG Path for Hexagon (Pointy top/bottom) based on 100x100 viewBox
const HEX_POINTS = "50,5 93.3,27.5 93.3,72.5 50,95 6.7,72.5 6.7,27.5";

const HexagonBase = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <polygon
            points={HEX_POINTS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
        />
        <polygon
            points={HEX_POINTS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
            transform="scale(0.8) translate(10,10)"
            style={{ transformOrigin: "center" }}
        />
    </svg>
);

// Pictograms
const IconUniversal = () => (
    <g stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <line x1="30" y1="35" x2="70" y2="35" />
        <line x1="30" y1="50" x2="70" y2="50" />
        <line x1="30" y1="65" x2="70" y2="65" />
    </g>
);

const IconSocial = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <circle cx="35" cy="40" r="10" />
        <circle cx="65" cy="40" r="10" />
        <path d="M35 55 Q50 70 65 55" />
        <circle cx="50" cy="65" r="6" fill="currentColor" />
    </g>
);


const IconMap = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <line x1="50" y1="20" x2="50" y2="80" />
        <line x1="20" y1="50" x2="80" y2="50" />
        <circle cx="50" cy="50" r="15" fill="none" />
        <circle cx="50" cy="50" r="2" fill="currentColor" />
    </g>
);

const IconStatus = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M20 50 L35 50 L45 30 L55 70 L65 50 L80 50" />
    </g>
);

const IconNotion = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <rect x="30" y="25" width="40" height="50" rx="4" />
        <line x1="40" y1="40" x2="60" y2="40" />
        <line x1="40" y1="55" x2="60" y2="55" />
    </g>
);

const IconSound = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M25 35 H35 L55 15 V85 L35 65 H25 V35 Z" />
        <path d="M65 35 Q75 50 65 65" />
        <path d="M75 25 Q90 50 75 75" />
    </g>
);

const IconHome = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M20 40 L50 15 L80 40 V85 H20 V40 Z" />
        <path d="M35 85 V55 H65 V85" />
    </g>
);

const IconGalaxy = () => (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
        <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(-30 50 50)" />
        <circle cx="50" cy="50" r="8" fill="currentColor" />
    </g>
);


const getIcon = (id: string, label?: string) => {
    switch (id) {
        case 'universal': return <IconUniversal />;
        case 'map': return <IconMap />;
        case 'social': return <IconSocial />;
        case 'status': return <IconStatus />;
        case 'notion': return <IconNotion />;
        case 'sound': return <IconSound />;
        case 'scene_toggle': return label === MENU_LABELS.HUD.HOME ? <IconHome /> : <IconGalaxy />;
        default: return null;
    }
};

interface MenuButtonItemProps {
    button: MenuButton;
    index: number;
    isVisible: boolean;
    onClick?: () => void;
    isMuted?: boolean;
}

const MenuButtonItem = ({ button, index, isVisible, onClick, isMuted }: MenuButtonItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                group relative flex flex-col items-center
                pointer-events-auto cursor-pointer
                transition-all duration-500 ease-out
                ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
                ${isHovered ? "scale-110" : "scale-100"}
                ${isPressed ? "brightness-150" : ""}
            `}
            style={{
                transitionDelay: `${index * 100}ms`,
            }}
        >
            {/* Large shortcut key */}
            <div
                className={`
                    absolute -top-1 -right-1 z-20
                    flex items-center justify-center
                    w-5 h-5 rounded-md
                    bg-[#FAFAFA] text-black
                    font-mono text-xs font-black
                    shadow-sm
                    transition-all duration-200
                `}
                style={{
                    boxShadow: isHovered ? "0 0 8px rgba(255,136,0,0.6)" : "none"
                }}
            >
                {button.shortcut}
            </div>

            {/* Hexagon Wrapper & Icon */}
            <div
                className={`
                    relative w-14 h-14
                    transition-all duration-300 ease-out
                `}
                style={{
                    color: "#ff8800",
                    opacity: isMuted && button.id === 'sound' ? 0.5 : 1,
                    filter: isHovered ? "drop-shadow(0 0 16px #ff8800)" : "none"
                }}
            >
                <div className="absolute inset-0">
                    <HexagonBase className="w-full h-full" />
                </div>
                <div className="absolute inset-0 p-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {getIcon(button.id, button.label)}
                    </svg>
                </div>
                {isMuted && button.id === 'sound' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-1 bg-[#ff8800] rotate-45 transform origin-center drop-shadow-md" />
                    </div>
                )}
            </div>

            {/* Role name */}
            <div
                className={`
                    absolute -bottom-8 left-1/2 -translate-x-1/2
                    font-mono text-[10px] tracking-widest whitespace-nowrap
                    py-1 px-2
                    bg-black/80 backdrop-blur-sm border border-[#ff8800] rounded
                    shadow-[0_0_8px_rgba(255,136,0,0.8)]
                    transition-all duration-300 ease-out
                    ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
                `}
                style={{
                    color: "#ff8800",
                    textShadow: "0 0 4px rgba(255,136,0,0.5)"
                }}
            >
                {button.label}
            </div>
        </button>
    );
};

// GameMenuHUD now uses Zustand directly - no props required
export function GameMenuHUD() {
    const {
        currentScene,
        isMuted,
        openMenu,
        toggleMute,
        setCurrentScene,
        setViewMode,
        isLoading,
        setLoading,
    } = useStore();

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Build buttons from config
    const mainButtons = buildMainButtons(currentScene);
    const menuButton = buildMenuButton(currentScene);

    // Scene toggle logic (previously in page.tsx)
    const handleSceneToggle = () => {
        if (currentScene === 'start' || isLoading) return;

        const nextScene = currentScene === 'universe' ? 'my_galaxy' : 'universe';
        const text = nextScene === 'my_galaxy' ? UI_STRINGS.TRANSITION.INITIATING_DNA : UI_STRINGS.TRANSITION.RETURNING_UNIVERSE;

        setLoading(true, text);

        setTimeout(() => {
            setCurrentScene(nextScene);
            setViewMode('universe');
            setLoading(false);
        }, 2000);
    };

    const getHandler = (id: string) => {
        switch (id) {
            case 'universal': return () => openMenu('menu');
            case 'map': return () => openMenu('map');
            case 'social': return () => openMenu('social');
            case 'status': return () => openMenu('status');
            case 'notion': return () => openMenu('notion');
            case 'sound': return toggleMute;
            case 'scene_toggle': return handleSceneToggle;
            default: return undefined;
        }
    };

    return (
        <div className="fixed top-6 right-6 z-50 pointer-events-none flex flex-col items-end gap-6">

            {/* Left to Right: [GALAXY, SOUND, NOTION, STATUS, MAP, SOCIAL] | [MENU] */}
            <div className="flex flex-row items-center gap-5">
                {/* Main menu buttons (left side) */}
                {mainButtons.map((button, index) => (
                    <MenuButtonItem
                        key={button.id}
                        button={button}
                        index={index}
                        isVisible={isLoaded}
                        onClick={getHandler(button.id)}
                        isMuted={isMuted}
                    />
                ))}

                {/* Vertical Separator Line */}
                <div
                    className={`
                        w-[1px] h-10 bg-white/30
                        transition-all duration-500 ease-out
                        ${isLoaded ? "opacity-100" : "opacity-0"}
                    `}
                    style={{
                        boxShadow: "0 0 4px rgba(255,255,255,0.2)",
                    }}
                />

                {/* Separated MENU button (right side) */}
                <MenuButtonItem
                    button={menuButton}
                    index={mainButtons.length}
                    isVisible={isLoaded}
                    onClick={getHandler(menuButton.id)}
                    isMuted={isMuted}
                />
            </div>

            {/* Decorative Corner */}
            <div
                className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2"
                style={{ borderColor: "rgba(255,136,0,0.4)" }}
            />
        </div>
    );
}
