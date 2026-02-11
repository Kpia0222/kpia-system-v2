import { SceneStrategy } from "./types";
import { useStore } from "@/store/useStore";
import { MyGalaxyScene } from "@/components/canvas/scenes/MyGalaxyScene";
import { StartScreenDecorations } from "@/components/canvas/environments/StartScreenDecorations";
import { CAMERA_CONSTRAINTS } from "@/config/camera-settings";

export const StartStrategy: SceneStrategy = {
    id: "start",

    Component: ({ controlsRef }) => {
        const { isInitialDive, isStartupTransition } = useStore();

        return (
            <>
                <group position={[-150, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
                    <MyGalaxyScene
                        controlsRef={controlsRef}
                        mode="decorative"
                        isDiving={isInitialDive}
                    />
                </group>
                <StartScreenDecorations isTransitioning={isStartupTransition} />
            </>
        );
    },

    getCameraConfig: (_store) => {
        return {
            ...CAMERA_CONSTRAINTS.start,
            makeDefault: true,
        };
    }
};
