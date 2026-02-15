import { SceneStrategy, CameraConfig } from "./types";
import { AppState } from "@/store/useStore";
import { SkillScene } from "@/components/canvas/scenes/SkillScene";

export const SkillStrategy: SceneStrategy = {
    id: 'skill',
    Component: SkillScene,
    getCameraConfig: (store: AppState): CameraConfig => {
        return {
            enabled: true,
            minDistance: 10,
            maxDistance: 100,
            makeDefault: true,
        };
    },
};
