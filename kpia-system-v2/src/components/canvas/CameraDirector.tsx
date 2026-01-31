"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { CameraControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import {
    CAM_POS_DEFAULT,
    CAM_POS_ZOOM,
    CAM_POS_START,
    STARTUP_LOOK_AT,
} from "@/config/camera-settings";
import { TRANSITION_DURATIONS } from "@/config/system-settings";

// ============================================================================
// CameraDirector - Centralized camera animation control
// ============================================================================

export interface CameraDirectorHandle {
    controls: React.RefObject<CameraControls>;
    universeControls: React.RefObject<CameraControls>;
}

interface CameraDirectorProps {
    scene: 'start' | 'universe' | 'my_galaxy';
}

/**
 * CameraDirector manages all camera animations based on config settings.
 * - Initial dive animation on startup
 * - Scene transition animations
 * - Camera constraints per scene
 */
export const CameraDirector = forwardRef<CameraDirectorHandle, CameraDirectorProps>(
    ({ scene }, ref) => {
        const controlsRef = useRef<CameraControls>(null!);
        const universeControlsRef = useRef<CameraControls>(null!);

        const {
            isStartupTransition,
            isInitialDive,
            isDiving,
            viewMode,
            setInitialDive,
            setCurrentScene,
            setAwakening,
            setStartupTransition,
        } = useStore();

        // Expose refs to parent
        useImperativeHandle(ref, () => ({
            controls: controlsRef,
            universeControls: universeControlsRef,
        }));

        // ========================================
        // Initial Dive Animation (Start Scene)
        // ========================================
        useEffect(() => {
            if (scene !== 'start' || !isInitialDive || !controlsRef.current) return;

            // Set initial far position
            controlsRef.current.setLookAt(0, 0, STARTUP_LOOK_AT.z, 0, 0, 0, false);

            // Animate to start position
            const moveTimer = setTimeout(() => {
                controlsRef.current?.setLookAt(
                    CAM_POS_START.x, CAM_POS_START.y, CAM_POS_START.z,
                    0, 0, 0, true
                );
            }, TRANSITION_DURATIONS.cameraMove);

            // Complete dive
            const completeTimer = setTimeout(() => {
                setInitialDive(false);
            }, TRANSITION_DURATIONS.initialDive);

            return () => {
                clearTimeout(moveTimer);
                clearTimeout(completeTimer);
            };
        }, [scene, isInitialDive, setInitialDive]);

        // ========================================
        // Startup Transition Animation (Start → MyGalaxy)
        // ========================================
        useEffect(() => {
            if (!isStartupTransition || !controlsRef.current) return;

            // Midpoint: Switch scene
            const midpointTimer = setTimeout(() => {
                setCurrentScene('my_galaxy');
                setAwakening(true);

                // Jump to zoom position
                controlsRef.current?.setLookAt(
                    CAM_POS_ZOOM.x, CAM_POS_ZOOM.y, CAM_POS_ZOOM.z * 1.5,
                    0, 0, 0, false
                );

                // Animate to default position
                setTimeout(() => {
                    controlsRef.current?.setLookAt(
                        CAM_POS_DEFAULT.x, CAM_POS_DEFAULT.y, CAM_POS_DEFAULT.z,
                        0, 0, 0, true
                    );
                }, TRANSITION_DURATIONS.cameraMove);

                // End awakening effect
                setTimeout(() => {
                    setAwakening(false);
                }, TRANSITION_DURATIONS.awakeningEffect);
            }, TRANSITION_DURATIONS.sceneTransition / 2);

            // Complete transition
            const completeTimer = setTimeout(() => {
                setStartupTransition(false);
            }, TRANSITION_DURATIONS.sceneTransition);

            return () => {
                clearTimeout(midpointTimer);
                clearTimeout(completeTimer);
            };
        }, [isStartupTransition, setCurrentScene, setAwakening, setStartupTransition]);

        // ========================================
        // Render Camera Controls per Scene
        // ========================================
        if (scene === 'start') {
            return (
                <CameraControls
                    ref={controlsRef}
                    makeDefault
                    minDistance={10}
                    maxDistance={2000}
                    smoothTime={1.5}
                    enabled={false}
                />
            );
        }

        if (scene === 'my_galaxy') {
            return (
                <CameraControls
                    ref={controlsRef}
                    makeDefault
                    minDistance={100}
                    maxDistance={1000}
                    smoothTime={isDiving ? 0.3 : 1.5}
                />
            );
        }

        if (scene === 'universe') {
            if (viewMode === 'universe') {
                return (
                    <CameraControls
                        ref={universeControlsRef}
                        minDistance={50}
                        maxDistance={800}
                        smoothTime={0.8}
                    />
                );
            }
            if (viewMode === 'galaxy') {
                return (
                    <CameraControls
                        ref={controlsRef}
                        minDistance={5}
                        maxDistance={500}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI}
                    />
                );
            }
        }

        return null;
    }
);

CameraDirector.displayName = "CameraDirector";
