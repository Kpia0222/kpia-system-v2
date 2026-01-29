"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { galaxies } from "@/config/galaxy-data";

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
            const anyMenuOpen = isMenuOpen || isMapOpen || isStatusOpen || isNotionOpen;

            // === Escape key handling ===
            if (e.key === 'Escape') {
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

            // === U key: Toggle universal menu ===
            if (e.key.toUpperCase() === 'U') {
                e.preventDefault();
                toggleMenu('menu');
                return;
            }

            // === F2: Toggle mute ===
            if (e.key === 'F2') {
                e.preventDefault();
                toggleMute();
                return;
            }

            // === Start screen: block most shortcuts ===
            if (currentScene === 'start') return;

            // === Home key: Return to start ===
            if (e.key === 'Home' && !isLoading) {
                e.preventDefault();
                returnToStart();
                return;
            }

            // === F1: Toggle scene mode ===
            if (e.key === 'F1' && !anyMenuOpen) {
                e.preventDefault();
                toggleSceneMode();
                return;
            }

            // === F3: Notion menu ===
            if (e.key === 'F3' && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('notion');
                return;
            }

            // === F4: Status menu ===
            if (e.key === 'F4' && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('status');
                return;
            }

            // === F5: Map menu ===
            if (e.key === 'F5' && !anyMenuOpen) {
                e.preventDefault();
                toggleMenu('map');
                return;
            }

            // === Block if menu open or transitioning ===
            if (anyMenuOpen || isTransitioning || isLoading) return;

            // === Enter: Select/Enter galaxy ===
            if (e.key === 'Enter') {
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
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                if (isTransitioning || viewMode === 'galaxy') return;

                e.preventDefault();
                const currentId = selectedGalaxyId || hoveredGalaxyId;
                let currentIndex = galaxies.findIndex(g => g.id === currentId);
                if (currentIndex === -1) currentIndex = -1;

                let nextIndex: number;
                if (e.key === 'ArrowRight') {
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
