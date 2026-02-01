"use client";

import { useState, RefObject } from "react";
import { CameraControls, Float } from "@react-three/drei";
import { DnaModel } from "@/components/canvas/objects/DnaModel";
import { MeteorEnvironment } from "@/components/canvas/environments/MeteorEnvironment";
import { METEOR_DEFAULTS, MYSTIC_GLASS_PLACEMENT, DUMMY_BEACONS } from "@/config/environment-settings";
import { FloatingFragments } from "@/components/canvas/objects/FloatingFragments";
import { MysticGlass } from "@/components/canvas/objects/MysticGlass";
import { BeaconCluster } from "@/components/canvas/objects/ObserverBeacon";


// ============================================================================
// Scene Props
// ============================================================================
interface MyGalaxySceneProps {
    controlsRef: RefObject<CameraControls>;
    mode?: 'interactive' | 'decorative';
    isDiving?: boolean;
}

// ============================================================================
// MyGalaxyScene Component
// ============================================================================
export function MyGalaxyScene({
    controlsRef,
    mode = 'interactive',
    isDiving = false
}: MyGalaxySceneProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <group>
            {/* DNA Helix */}
            <DnaModel
                controlsRef={controlsRef}
                mode={mode}
                isDiving={isDiving}
                isHovered={isHovered}
                onHoverChange={setIsHovered}
            />

            {/* Floating Fragments (Drafts) */}
            <FloatingFragments />

            {/* Mystic Glass - 極上のガラスオブジェクト */}
            <Float
                speed={MYSTIC_GLASS_PLACEMENT.float.speed}
                rotationIntensity={MYSTIC_GLASS_PLACEMENT.float.rotationIntensity}
                floatIntensity={MYSTIC_GLASS_PLACEMENT.float.floatIntensity}
            >
                <MysticGlass
                    position={MYSTIC_GLASS_PLACEMENT.position}
                    scale={MYSTIC_GLASS_PLACEMENT.scale}
                />
            </Float>

            {/* Observer Beacons - 他の探索者からのビーコン */}
            <BeaconCluster beacons={DUMMY_BEACONS} />

            {/* Meteor Environment (Kuiper Belt Ring) */}
            <MeteorEnvironment
                minRadius={METEOR_DEFAULTS.minRadius}
                maxRadius={METEOR_DEFAULTS.maxRadius}
                count={METEOR_DEFAULTS.count}
                color={METEOR_DEFAULTS.color}
                shapeType={METEOR_DEFAULTS.shapeType}
            />
        </group>
    );
}


