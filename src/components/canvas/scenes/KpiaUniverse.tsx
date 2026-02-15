"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useCursor, CameraControls } from "@react-three/drei";
import * as THREE from "three";

// 銀河データを設定ファイルからインポート
import { GalaxyType, GalaxyData, galaxies } from "@/config/galaxy-data";
import { GALAXY_CLUSTER_SETTINGS } from "@/config/environment-settings";
import { UI_COLORS } from "@/config/system-settings";





// 型定義を再エクスポート（後方互換性のため）
export type { GalaxyType, GalaxyData };
export { galaxies };

// ----------------------------------------------------------------------




// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
interface KpiaUniverseProps {
    hoveredGalaxy: GalaxyData | null;
    selectedGalaxy: GalaxyData | null;
    onHoverGalaxy: (data: GalaxyData | null) => void;
    onSelectGalaxy: (data: GalaxyData | null) => void;
    controlsRef: React.RefObject<CameraControls | null>;
}

export function KpiaUniverse({
    hoveredGalaxy,
    selectedGalaxy,
    onHoverGalaxy,
    onSelectGalaxy,
    controlsRef
}: KpiaUniverseProps) {
    // 視点移動の副作用
    useEffect(() => {
        if (selectedGalaxy) {
            // ズームイン
            const [gx, gy, gz] = selectedGalaxy.position;
            controlsRef.current?.setLookAt(
                gx, gy + 50, gz + 100, // Eye
                gx, gy, gz,          // Target
                true                 // Animated
            );
        } else {
            // リセット（全体俯瞰）
            controlsRef.current?.setLookAt(
                0, 200, 400, // Eye (Default)
                0, 0, 0,   // Target
                true
            );
        }
    }, [selectedGalaxy, controlsRef]);

    return (
        <group>
            {/* Background elements to avoid void */}

            {/* Background elements to avoid void */}
            {/* Background elements to avoid void */}
            {/* Milky Way Galaxy Background - Restored */}


            {galaxies.map((galaxy) => (
                <Float key={galaxy.id} speed={galaxy.type === 'chaos' ? 2 : 1} rotationIntensity={0.5} floatIntensity={0.5}>
                    <group position={galaxy.position} rotation={galaxy.rotation ? new THREE.Euler(...galaxy.rotation) : undefined}>
                        {/* Hit Area (Invisible Sphere) */}
                        <mesh
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(galaxy);
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(null);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectGalaxy(galaxy);
                                onHoverGalaxy(galaxy);
                            }}
                            visible={false}
                        >
                            <sphereGeometry args={[60, 16, 16]} />
                            <meshBasicMaterial />
                        </mesh>

                        {/* Visual Representation: Mini Spiral Galaxy instead of Polyhedron */}

                    </group>
                </Float>
            ))}
        </group>
    );
}
