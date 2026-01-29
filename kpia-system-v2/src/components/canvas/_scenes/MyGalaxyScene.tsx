"use client";

import { useRef, useState, RefObject } from "react";
import { CameraControls } from "@react-three/drei";
import { DnaModel } from "@/components/canvas/objects/DnaModel";
import { MeteorEnvironment } from "@/components/canvas/environments/MeteorEnvironment";
import { METEOR_DEFAULTS } from "@/config/environment-settings";
import { MusicFragments } from "@/components/canvas/objects/MusicFragments";

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

            {/* Music Fragments (Drafts) */}
            <MusicFragments />

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
