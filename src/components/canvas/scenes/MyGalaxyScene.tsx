import { useState, RefObject } from "react";
import { CameraControls, Float } from "@react-three/drei";
import { DnaModel } from "@/components/canvas/objects";
import { MYSTIC_GLASS_PLACEMENT, DUMMY_BEACONS } from "@/config/environment-settings";

import { MysticGlass } from "@/components/canvas/objects";
import { BeaconCluster } from "@/components/canvas/objects";
import { useStore } from "@/store/useStore";


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
    isDiving: isDivingProp,
}: MyGalaxySceneProps) {
    const isDivingStore = useStore((state) => state.isDiving);
    const isDiving = isDivingProp !== undefined ? isDivingProp : isDivingStore;
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
        </group>
    );
}


