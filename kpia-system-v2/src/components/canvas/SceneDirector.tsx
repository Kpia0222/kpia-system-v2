"use client";

import { useRef } from "react";
import { Sparkles, CameraControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { UI_COLORS, TRANSITION_DURATIONS } from "@/config/system-settings";
import {
    CAM_POS_DEFAULT,
    CAM_POS_ZOOM,
    CAM_POS_START,
    STARTUP_LOOK_AT,
    CAMERA_CONSTRAINTS,
} from "@/config/camera-settings";
import { useEffect } from "react";

// Scene Components
import { KpiaUniverse, galaxies } from "@/components/canvas/_scenes/KpiaUniverse";
import { GalaxyInterior } from "@/components/canvas/_scenes/GalaxyInterior";
import { MyGalaxyScene } from "@/components/canvas/_scenes/MyGalaxyScene";
import { StartScreenDecorations } from "@/components/canvas/environments/StartScreenDecorations";
import { KuiperBelt } from "@/components/canvas/environments/KuiperBelt";

// ============================================================================
// SceneDirector - Manages 3D scene rendering and camera controls
// ============================================================================

/**
 * SceneDirector manages all 3D scene rendering based on currentScene and viewMode.
 * Also handles camera animation logic that was previously in page.tsx.
 */
export function SceneDirector() {
    const controlsRef = useRef<CameraControls>(null!);
    const universeControlsRef = useRef<CameraControls>(null!);

    const {
        currentScene,
        viewMode,
        isStartupTransition,
        isInitialDive,
        isDiving,
        isTransitioning,
        hoveredGalaxyId,
        selectedGalaxyId,
        setHoveredGalaxy,
        setSelectedGalaxy,
        exitGalaxy,
        setInitialDive,
        setCurrentScene,
        setAwakening,
        setStartupTransition,
    } = useStore();

    // Derived galaxy data
    const hoveredGalaxy = galaxies.find(g => g.id === hoveredGalaxyId) ?? null;
    const selectedGalaxy = galaxies.find(g => g.id === selectedGalaxyId) ?? null;

    // ========================================
    // Initial Dive Animation (Start Scene)
    // ========================================
    useEffect(() => {
        if (currentScene !== 'start' || !isInitialDive || !controlsRef.current) return;

        controlsRef.current.setLookAt(0, 0, STARTUP_LOOK_AT.z, 0, 0, 0, false);

        const moveTimer = setTimeout(() => {
            controlsRef.current?.setLookAt(
                CAM_POS_START.x, CAM_POS_START.y, CAM_POS_START.z,
                0, 0, 0, true
            );
        }, TRANSITION_DURATIONS.cameraMove);

        const completeTimer = setTimeout(() => {
            setInitialDive(false);
        }, TRANSITION_DURATIONS.initialDive);

        return () => {
            clearTimeout(moveTimer);
            clearTimeout(completeTimer);
        };
    }, [currentScene, isInitialDive, setInitialDive]);

    // ========================================
    // Startup Transition Animation (Start → MyGalaxy)
    // ========================================
    useEffect(() => {
        if (!isStartupTransition || !controlsRef.current) return;

        const midpointTimer = setTimeout(() => {
            setCurrentScene('my_galaxy');
            setAwakening(true);

            controlsRef.current?.setLookAt(
                CAM_POS_ZOOM.x, CAM_POS_ZOOM.y, CAM_POS_ZOOM.z * 1.5,
                0, 0, 0, false
            );

            setTimeout(() => {
                controlsRef.current?.setLookAt(
                    CAM_POS_DEFAULT.x, CAM_POS_DEFAULT.y, CAM_POS_DEFAULT.z,
                    0, 0, 0, true
                );
            }, TRANSITION_DURATIONS.cameraMove);

            setTimeout(() => {
                setAwakening(false);
            }, TRANSITION_DURATIONS.awakeningEffect);
        }, TRANSITION_DURATIONS.sceneTransition / 2);

        const completeTimer = setTimeout(() => {
            setStartupTransition(false);
        }, TRANSITION_DURATIONS.sceneTransition);

        return () => {
            clearTimeout(midpointTimer);
            clearTimeout(completeTimer);
        };
    }, [isStartupTransition, setCurrentScene, setAwakening, setStartupTransition]);

    // ========================================
    // Start Scene
    // ========================================
    if (currentScene === 'start') {
        return (
            <>
                <CameraControls
                    ref={controlsRef}
                    makeDefault
                    minDistance={CAMERA_CONSTRAINTS.start.minDistance}
                    maxDistance={CAMERA_CONSTRAINTS.start.maxDistance}
                    smoothTime={CAMERA_CONSTRAINTS.start.smoothTime}
                    enabled={CAMERA_CONSTRAINTS.start.enabled}
                />
                <group position={[-150, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
                    <MyGalaxyScene
                        controlsRef={controlsRef}
                        mode="decorative"
                        isDiving={isInitialDive}
                    />
                    <Sparkles
                        count={200}
                        scale={400}
                        size={2}
                        speed={0.4}
                        opacity={0.3}
                        color={UI_COLORS.primary}
                    />
                </group>
                <StartScreenDecorations isTransitioning={isStartupTransition} />
            </>
        );
    }

    // ========================================
    // My Galaxy Scene
    // ========================================
    if (currentScene === 'my_galaxy') {
        return (
            <>
                <CameraControls
                    ref={controlsRef}
                    makeDefault
                    minDistance={CAMERA_CONSTRAINTS.myGalaxy.minDistance}
                    maxDistance={CAMERA_CONSTRAINTS.myGalaxy.maxDistance}
                    smoothTime={isDiving ? CAMERA_CONSTRAINTS.myGalaxy.smoothTime.diving : CAMERA_CONSTRAINTS.myGalaxy.smoothTime.default}
                />
                <MyGalaxyScene controlsRef={controlsRef} isDiving={isDiving} />
                <KuiperBelt />
                <Sparkles
                    count={500}
                    scale={800}
                    size={2}
                    speed={0.2}
                    opacity={0.5}
                    color={UI_COLORS.primary}
                />
            </>
        );
    }

    // ========================================
    // Universe Scene
    // ========================================
    if (currentScene === 'universe') {
        return (
            <>
                {/* Universal Sparkles */}
                <Sparkles
                    count={viewMode === 'universe' ? 5000 : 2000}
                    scale={viewMode === 'universe' ? 1000 : 100}
                    size={viewMode === 'universe' ? 0.5 : 1.5}
                    speed={0.1}
                    color={viewMode === 'galaxy' && selectedGalaxy ? '#ff8800' : '#ffffff'}
                    opacity={0.2}
                />

                {/* Universe View */}
                {viewMode === 'universe' && !isTransitioning && (
                    <>
                        <CameraControls
                            ref={universeControlsRef}
                            minDistance={CAMERA_CONSTRAINTS.universe.minDistance}
                            maxDistance={CAMERA_CONSTRAINTS.universe.maxDistance}
                            smoothTime={CAMERA_CONSTRAINTS.universe.smoothTime}
                        />
                        <KpiaUniverse
                            hoveredGalaxy={hoveredGalaxy}
                            selectedGalaxy={selectedGalaxy}
                            onHoverGalaxy={(g) => setHoveredGalaxy(g?.id ?? null)}
                            onSelectGalaxy={(g) => setSelectedGalaxy(g?.id ?? null)}
                            controlsRef={universeControlsRef}
                        />
                    </>
                )}

                {/* Galaxy Interior View */}
                {viewMode === 'galaxy' && !isTransitioning && selectedGalaxy && (
                    <>
                        <CameraControls
                            ref={controlsRef}
                            minDistance={CAMERA_CONSTRAINTS.galaxyInterior.minDistance}
                            maxDistance={CAMERA_CONSTRAINTS.galaxyInterior.maxDistance}
                            minPolarAngle={CAMERA_CONSTRAINTS.galaxyInterior.minPolarAngle}
                            maxPolarAngle={CAMERA_CONSTRAINTS.galaxyInterior.maxPolarAngle}
                        />
                        <GalaxyInterior galaxy={selectedGalaxy} onBack={exitGalaxy} />
                    </>
                )}
            </>
        );
    }

    return null;
}
