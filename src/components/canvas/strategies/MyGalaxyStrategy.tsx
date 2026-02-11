import { SceneStrategy } from "./types";
import { MyGalaxyScene } from "@/components/canvas/scenes/MyGalaxyScene";
import { KuiperBelt } from "@/components/canvas/environments/KuiperBelt";
import { CAMERA_CONSTRAINTS } from "@/config/camera-settings";

export const MyGalaxyStrategy: SceneStrategy = {
    id: "my_galaxy",

    Component: ({ controlsRef }) => (
        <>
            <MyGalaxyScene controlsRef={controlsRef} />
            <KuiperBelt />
        </>
    ),

    getCameraConfig: ({ isDiving, isStartupTransition }) => {
        const { minDistance, maxDistance, smoothTime } = CAMERA_CONSTRAINTS.myGalaxy;
        return {
            minDistance,
            maxDistance,
            smoothTime: isDiving ? smoothTime.diving : smoothTime.default,
            enabled: !isStartupTransition,
            makeDefault: true,
        };
    }
};
