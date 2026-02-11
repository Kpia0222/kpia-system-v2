import { CameraControls } from "@react-three/drei";
import { RefObject } from "react";
import { AppState } from "@/store/useStore";

export interface CameraConfig {
    minDistance?: number;
    maxDistance?: number;
    smoothTime?: number;
    enabled?: boolean;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    makeDefault?: boolean;
}

export interface SceneStrategy {
    id: string;
    Component: React.FC<{ controlsRef: RefObject<CameraControls> }>;
    getCameraConfig: (store: AppState) => CameraConfig;
}
