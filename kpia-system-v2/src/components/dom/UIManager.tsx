"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { TRANSITION_DURATIONS } from "@/config/system-settings";
import { UI_STRINGS, KEYBOARD_HINTS } from "@/config/ui-strings";
import { galaxies } from "@/components/canvas/_scenes/KpiaUniverse";

// Overlays
import { StartScreen } from "@/components/dom/overlays/StartScreen";
import { LoadingScreen } from "@/components/dom/overlays/LoadingScreen";
import { GalaxyEntryCutIn } from "@/components/dom/overlays/GalaxyEntryCutIn";
import { RealtimeToast } from "@/components/dom/overlays/RealtimeToast";
import { SocialMenu } from "@/components/dom/overlays/SocialMenu";
import { TransitionOverlay } from "@/components/canvas/effects/TransitionOverlay";
import { ScanlineEffect } from "@/components/dom/effects/ScanlineEffect";

// Menus
import { GameMenuHUD } from "@/components/dom/menus/GameMenuHUD";
import { UniversalMenu } from "@/components/dom/menus/UniversalMenu";
import { StatusMenu } from "@/components/dom/features/StatusMenu";
import { NotionMenu } from "@/components/dom/menus/NotionMenu";
import { MapMenu } from "@/components/dom/menus/MapMenu";

// Features
import { ErosionGauge } from "@/components/dom/features/ErosionGauge";
import AuthOverlay from "@/components/dom/features/auth/AuthOverlay";
import { SystemInfoPanel } from "@/components/dom/shared/SystemInfoPanel";
import { CyberButton } from "@/components/dom/shared/CyberButton";

// ============================================================================
// UIManager - Centralized UI overlay and menu management
// ============================================================================

/**
 * UIManager handles all 2D UI rendering:
 * - Overlays (StartScreen, Loading, Auth)
 * - Menus (Universal, Status, Notion, Map, Social)
 * - HUD elements (GameMenuHUD, SystemInfoPanel, ErosionGauge)
 * - Action buttons
 * - Keyboard hints
 */
export function UIManager() {
    const {
        currentScene,
        viewMode,
        isTransitioning,
        isLoading,
        loadingText,
        isStartupTransition,
        isAuthOpen,
        hoveredGalaxyId,
        selectedGalaxyId,
        closeMenu,
        startSystem,
        enterGalaxy,
        exitGalaxy,
        completeGalaxyEntry,
    } = useStore();

    // Derived galaxy data
    const hoveredGalaxy = useMemo(
        () => galaxies.find(g => g.id === hoveredGalaxyId) ?? null,
        [hoveredGalaxyId]
    );
    const selectedGalaxy = useMemo(
        () => galaxies.find(g => g.id === selectedGalaxyId) ?? null,
        [selectedGalaxyId]
    );
    const activeData = selectedGalaxy || hoveredGalaxy;

    return (
        <>
            {/* ===== START SCREEN ===== */}
            <AnimatePresence>
                {currentScene === 'start' && (
                    <StartScreen
                        onStartSystem={startSystem}
                        isTransitioning={isStartupTransition}
                    />
                )}
            </AnimatePresence>

            {/* ===== TRANSITION OVERLAY ===== */}
            <TransitionOverlay
                active={isStartupTransition}
                duration={TRANSITION_DURATIONS.sceneTransition}
            />

            {/* ===== MENUS ===== */}
            <UniversalMenu />
            <StatusMenu />
            <NotionMenu />
            <MapMenu />
            <SocialMenu />
            <RealtimeToast />

            {/* ===== AUTH OVERLAY ===== */}
            <AnimatePresence>
                {isAuthOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
                        onClick={() => closeMenu('auth')}
                    >
                        <div onClick={(e) => e.stopPropagation()}>
                            <AuthOverlay />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== LOADING SCREEN ===== */}
            <LoadingScreen isVisible={isLoading} text={loadingText} />

            {/* ===== GALAXY ENTRY CUT-IN ===== */}
            <AnimatePresence>
                {isTransitioning && selectedGalaxy && (
                    <GalaxyEntryCutIn
                        galaxyName={selectedGalaxy.name}
                        onComplete={completeGalaxyEntry}
                    />
                )}
            </AnimatePresence>

            {/* ===== HUD (Visible when not on start screen) ===== */}
            {currentScene !== 'start' && !isTransitioning && (
                <>
                    <GameMenuHUD />
                    <SystemInfoPanel />
                </>
            )}

            {/* ===== EROSION GAUGE ===== */}
            {currentScene === 'universe' && !isTransitioning && viewMode === 'universe' && (
                <ErosionGauge
                    erosionLevel={activeData?.erosionLevel ? Math.round(activeData.erosionLevel * 100) : 0}
                    isVisible={!!hoveredGalaxy || !!selectedGalaxy}
                    galaxyName={activeData?.name}
                />
            )}

            {/* ===== ACTION BUTTONS ===== */}
            {currentScene === 'universe' && viewMode === 'universe' && selectedGalaxy && !isTransitioning && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 pointer-events-auto">
                    <CyberButton onClick={enterGalaxy}>
                        {UI_STRINGS.ACTIONS.ENTER_GALAXY}
                    </CyberButton>
                </div>
            )}

            {currentScene === 'universe' && viewMode === 'galaxy' && (
                <div className="absolute top-8 left-8 pointer-events-auto">
                    <CyberButton
                        variant="secondary"
                        onClick={exitGalaxy}
                        className="flex items-center gap-2 hover:drop-shadow-[0_0_8px_#ff8800]"
                    >
                        {UI_STRINGS.ACTIONS.BACK_TO_UNIVERSE}
                    </CyberButton>
                </div>
            )}

            {/* ===== KEYBOARD HINTS ===== */}
            {currentScene !== 'start' && (
                <div className="absolute bottom-4 right-4 font-mono text-right pointer-events-none text-white text-[12px] tracking-widest">
                    {KEYBOARD_HINTS.MENU} &nbsp;&nbsp; {KEYBOARD_HINTS.SELECT} &nbsp;&nbsp; {KEYBOARD_HINTS.ZOOM} &nbsp;&nbsp; {KEYBOARD_HINTS.BACK}
                </div>
            )}

            {/* ===== SCANLINE EFFECT ===== */}
            <ScanlineEffect />
        </>
    );
}
