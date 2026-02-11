"use client";

import { useRef, useMemo } from "react";
import { CameraControls } from "@react-three/drei";
import { StarDust } from "@/components/canvas/environments/StarDust";
import { useStore } from "@/store/useStore";
import { STARDUST_CONFIG } from "@/config/environment-settings";
import { useStartupSequence } from "@/hooks/useStartupSequence";
import { useInitialDiveSequence } from "@/hooks/useInitialDiveSequence"; // 新設フック
import { strategies } from "@/components/canvas/strategies";

// 各シーンの描画ロジックは Strategy Pattern により各ファイルに委譲される
export function SceneDirector() {
    const controlsRef = useRef<CameraControls>(null!);
    const store = useStore();
    const { currentScene } = store;

    // 各種シーケンスロジックをフックに委譲（SceneDirectorを250行以下に保つ）
    useStartupSequence(controlsRef);
    useInitialDiveSequence(controlsRef);

    // 現在のシーンに応じたレンダリング戦略を選択
    const currentStrategy = strategies[currentScene];

    // カメラ設定の動的解決
    const cameraConfig = useMemo(() => {
        if (!currentStrategy) return {};
        return currentStrategy.getCameraConfig(store);
    }, [currentStrategy, store]);

    return (
        <>
            {/* 宇宙背景：設定値はすべて config から取得 */}
            <StarDust {...STARDUST_CONFIG} />

            {/* カメラ制御：Strategyに基づいた動的プロパティ付与 */}
            {currentStrategy && (
                <CameraControls ref={controlsRef} {...cameraConfig} />
            )}

            {/* シーン本体：コンポーネントとしての描画を委譲 */}
            {currentStrategy && (
                <currentStrategy.Component controlsRef={controlsRef} />
            )}
        </>
    );
}