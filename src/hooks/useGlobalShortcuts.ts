"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { galaxies } from "@/config/galaxy-data";
import { SHORTCUTS } from "@/config/shortcuts";

/**
 * グローバルキーボードショートカットを管理するカスタムフック
 * アプリケーション全体で一貫したショートカット操作を提供します
 */
export function useGlobalShortcuts() {
    const {
        currentScene,
        viewMode,
        setViewMode,
        setDnaMode,
        setDiving,
        setLoading,
        isLoading,
        isTransitioning,
        setTransitioning,
        // Galaxy selection
        hoveredGalaxyId,
        selectedGalaxyId,
        setHoveredGalaxy,
        setSelectedGalaxy,
        // Menu states
        isMenuOpen,
        isMapOpen,
        isStatusOpen,
        isNotionOpen,
        isSocialOpen,
        openMenu,
        toggleMenu,
        toggleMute,
        closeAllMenus,
        // Transition actions
        returnToStart,
        toggleSceneMode,
        enterGalaxy,
    } = useStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Input focus check: disable shortcuts if typing
            const activeElement = document.activeElement;
            const isInputActive = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                (activeElement as HTMLElement).isContentEditable
            );

            // Allow Escape to potentially blur input (default behavior) or close menus if handled
            // If input is active, we generally ignore app shortcuts except maybe Escape logic if desired.
            if (isInputActive && e.key !== 'Escape') return;

            const anyMenuOpen = isMenuOpen || isMapOpen || isStatusOpen || isNotionOpen || isSocialOpen;

            // Helper to check key match
            const isKey = (keys: readonly string[]) => keys.includes(e.key);

            // === Escape key handling ===
            if (isKey(SHORTCUTS.SYSTEM.ESCAPE)) {

                // If input is active, let default behavior happen (blur) and close menus if needed?
                // For now, if input is active, we treat Escape as "Blur" mostly. 
                // But request says "invalidate shortcuts". We proceed only if logic demands.
                if (isInputActive) {
                    (activeElement as HTMLElement).blur();
                    return;
                }

                // Priority 1: Close any open menu
                if (anyMenuOpen) {
                    e.preventDefault();
                    closeAllMenus();
                    return;
                }
                // Priority 2: Exit galaxy view
                if (viewMode === 'galaxy' && !isTransitioning) {
                    e.preventDefault();
                    setViewMode('universe');
                    setSelectedGalaxy(null);
                    return;
                }
                // Priority 3: Deselect galaxy
                if (selectedGalaxyId && !isTransitioning) {
                    e.preventDefault();
                    setSelectedGalaxy(null);
                    return;
                }
                // Priority 4: Open universal menu (if not on start screen)
                if (currentScene !== 'start') {
                    e.preventDefault();
                    toggleMenu('menu');
                    return;
                }
                return;
            }

            // If input was active, we returned above (except Escape).

            // === U key: Toggle universal menu ===
            if (isKey(SHORTCUTS.MENU.TOGGLE)) {
                e.preventDefault();
                toggleMenu('menu');
                return;
            }

            // === F2: Toggle mute ===
            if (isKey(SHORTCUTS.SYSTEM.MUTE)) {
                e.preventDefault();
                toggleMute();
                return;
            }

            // === Start screen: block most shortcuts ===
            if (currentScene === 'start') return;

            // === Home key: Return to start ===
            if (isKey(SHORTCUTS.SCENE.RETURN_START) && !isLoading) {
                e.preventDefault();
                returnToStart();
                return;
            }

            // === F1: Toggle scene mode ===
            if (isKey(SHORTCUTS.SCENE.TOGGLE_MODE) && !anyMenuOpen) {
                e.preventDefault();
                toggleSceneMode();
                return;
            }

            // === F3: Notion menu ===
            if (isKey(SHORTCUTS.NOTION.TOGGLE) && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('notion');
                return;
            }

            // === F4 / S: Status menu ===
            if (isKey(SHORTCUTS.STATUS.TOGGLE) && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('status');
                return;
            }

            // === F5 / M: Map menu ===
            if (isKey(SHORTCUTS.MAP.TOGGLE) && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('map');
                return;
            }

            // === F6: Social menu ===
            if (isKey(SHORTCUTS.SOCIAL.TOGGLE) && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('social');
                return;
            }

            // === Block if menu open or transitioning ===
            if (anyMenuOpen || isTransitioning || isLoading) return;

            // === Enter: Select/Enter galaxy ===
            if (isKey(SHORTCUTS.NAVIGATION.ENTER)) {
                if (hoveredGalaxyId && !selectedGalaxyId && !isTransitioning) {
                    e.preventDefault();
                    setSelectedGalaxy(hoveredGalaxyId);
                } else if (selectedGalaxyId && viewMode === 'universe' && !isTransitioning) {
                    e.preventDefault();
                    enterGalaxy();
                }
                return;
            }

            // === Arrow keys: Navigate galaxies ===
            if (isKey(SHORTCUTS.NAVIGATION.NEXT) || isKey(SHORTCUTS.NAVIGATION.PREV)) {
                if (isTransitioning || viewMode === 'galaxy') return;

                // Stop default scroll for arrows
                if (e.key.startsWith('Arrow')) e.preventDefault();

                const currentId = selectedGalaxyId || hoveredGalaxyId;
                let currentIndex = galaxies.findIndex(g => g.id === currentId);
                if (currentIndex === -1) currentIndex = -1;

                let nextIndex: number;
                if (isKey(SHORTCUTS.NAVIGATION.NEXT)) {
                    nextIndex = (currentIndex + 1) % galaxies.length;
                } else {
                    nextIndex = (currentIndex - 1 + galaxies.length) % galaxies.length;
                }

                const nextGalaxy = galaxies[nextIndex];
                setHoveredGalaxy(nextGalaxy.id);
                if (selectedGalaxyId) {
                    setSelectedGalaxy(nextGalaxy.id);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        currentScene,
        viewMode,
        isLoading,
        isTransitioning,
        hoveredGalaxyId,
        selectedGalaxyId,
        isMenuOpen,
        isMapOpen,
        isStatusOpen,
        isNotionOpen,
        isSocialOpen,
        setViewMode,
        setDnaMode,
        setDiving,
        setLoading,
        setTransitioning,
        setHoveredGalaxy,
        setSelectedGalaxy,
        openMenu,
        toggleMenu,
        toggleMute,
        closeAllMenus,
        returnToStart,
        toggleSceneMode,
    ]);
}
