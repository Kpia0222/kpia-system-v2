import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { CAMERA_FAR_LIMIT } from "@/config/environment-settings";
import { TRANSITION_DURATIONS } from "@/config/system-settings";

/**
 * 初回起動時のダイブ演出（ズームイン）を制御するカスタムフック
 * SceneDirectorから命令的なアニメーションロジックを分離するために作成
 */
export function useInitialDiveSequence(controlsRef: React.RefObject<CameraControls>) {
    const { camera } = useThree();
    const { isInitialDive, setInitialDive } = useStore();

    useEffect(() => {
        if (!isInitialDive || !controlsRef.current) return;

        // カメラの描画距離を宇宙規模に設定
        camera.far = CAMERA_FAR_LIMIT;
        camera.updateProjectionMatrix();

        // 演出の開始タイミングを遅延実行
        const timer = setTimeout(() => {
            // 憲法に基づき、演出時間はシステム設定から参照
            controlsRef.current?.zoomTo(1, true);
            setInitialDive(false);
        }, TRANSITION_DURATIONS.cameraMove); // using existing delay from system-settings

        return () => clearTimeout(timer);
    }, [isInitialDive, controlsRef, camera, setInitialDive]);
}
