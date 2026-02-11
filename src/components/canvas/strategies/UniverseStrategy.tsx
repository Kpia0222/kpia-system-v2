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
            };
        }

        return {
            minDistance: CAMERA_CONSTRAINTS.universe.minDistance,
            maxDistance: CAMERA_CONSTRAINTS.universe.maxDistance,
            smoothTime: CAMERA_CONSTRAINTS.universe.smoothTime,
        };
    }
};
