import { useEffect } from "react";
import { SceneStrategy } from "./types";
import { useStore } from "@/store/useStore";
import { KpiaUniverse, galaxies } from "@/components/canvas/scenes/KpiaUniverse";
import { GalaxyInterior } from "@/components/canvas/scenes/GalaxyInterior";
import { CAMERA_CONSTRAINTS } from "@/config/camera-settings";

export const UniverseStrategy: SceneStrategy = {
    id: "universe",

    Component: ({ controlsRef }) => {
        const {
            viewMode,
            isTransitioning,
            hoveredGalaxyId,
            selectedGalaxyId,
            setHoveredGalaxy,
            setSelectedGalaxy,
            exitGalaxy
        } = useStore();

        const hoveredGalaxy = galaxies.find(g => g.id === hoveredGalaxyId) ?? null;
        const selectedGalaxy = galaxies.find(g => g.id === selectedGalaxyId) ?? null;

        // 銀河内部に切り替わった際、カメラの注視点を銀河の中心(原点)にリセットする
        // これを行わないと、宇宙俯瞰時の銀河の位置を向いたままになり、操作が不能に見える
        useEffect(() => {
            if (viewMode === 'galaxy' && !isTransitioning) {
                controlsRef.current?.setTarget(0, 0, 0, true);
            }
        }, [viewMode, isTransitioning, controlsRef]);

        if (viewMode === 'universe' && !isTransitioning) {
            return (
                <KpiaUniverse
                    hoveredGalaxy={hoveredGalaxy}
                    selectedGalaxy={selectedGalaxy}
                    onHoverGalaxy={(g) => setHoveredGalaxy(g?.id ?? null)}
                    onSelectGalaxy={(g) => setSelectedGalaxy(g?.id ?? null)}
                    controlsRef={controlsRef}
                />
            );
        }

        if (viewMode === 'galaxy' && !isTransitioning && selectedGalaxy) {
            return (
                <GalaxyInterior galaxy={selectedGalaxy} onBack={exitGalaxy} />
            );
        }

        return null;
    },

    getCameraConfig: (store) => {
        const { viewMode } = store;

        if (viewMode === 'galaxy') {
            return {
                minDistance: CAMERA_CONSTRAINTS.galaxyInterior.minDistance,
                maxDistance: CAMERA_CONSTRAINTS.galaxyInterior.maxDistance,
                minPolarAngle: CAMERA_CONSTRAINTS.galaxyInterior.minPolarAngle,
                maxPolarAngle: CAMERA_CONSTRAINTS.galaxyInterior.maxPolarAngle,
                enabled: true,
                makeDefault: true,
            };
        }

        return {
            minDistance: CAMERA_CONSTRAINTS.universe.minDistance,
            maxDistance: CAMERA_CONSTRAINTS.universe.maxDistance,
            smoothTime: CAMERA_CONSTRAINTS.universe.smoothTime,
            enabled: true,
            makeDefault: true,
        };
    }
};
