import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import { STARTUP_TRANSITION, CAM_POS_ZOOM, CAM_POS_DEFAULT } from '@/config/camera-settings';
import { useControls, folder } from 'leva';

/**
 * スタートアップアニメーションのシーケンス制御フック
 * CameraControlsへの参照を受け取り、タイムラインに沿ってカメラ操作とステート更新を実行する
 */
export function useStartupSequence(controlsRef: React.RefObject<CameraControls | null>) {
    const {
        isStartupTransition,
        setCurrentScene,
        setAwakening,
        setStartupTransition,
        setStartupText,
        setStartupTips,
        setFadeSettings,
    } = useStore();

    // LEVA Config (リアルタイム調整用)
    // SceneDirectorから移動
    const transitionConfig = useControls('スタートアップ演出設定', {
        '⏱️ タイミング設定': folder({
            '全体所要時間 (ms)': { value: STARTUP_TRANSITION.totalDuration, min: 1000, max: 10000, step: 100 },
            'シーン切替位置 (0-1)': { value: STARTUP_TRANSITION.midpointRatio, min: 0.1, max: 0.9, step: 0.1 },
            '移動開始遅延 (ms)': { value: STARTUP_TRANSITION.cameraMoveDelay, min: 0, max: 2000, step: 50 },
            '覚醒エフェクト時間 (ms)': { value: STARTUP_TRANSITION.awakeningDuration, min: 1000, max: 5000, step: 100 },
        }),

        '📷 カメラ制御': folder({
            'ズーム倍率': { value: STARTUP_TRANSITION.zoomMultiplier, min: 0.1, max: 5, step: 0.1 },
            'ズームインアニメーション': { value: STARTUP_TRANSITION.animateZoomIn },
            'デフォルト位置移動アニメーション': { value: STARTUP_TRANSITION.animateMoveToDefault },
            '注視点 X': { value: STARTUP_TRANSITION.lookAt.x, min: -100, max: 100 },
            '注視点 Y': { value: STARTUP_TRANSITION.lookAt.y, min: -100, max: 100 },
            '注視点 Z': { value: STARTUP_TRANSITION.lookAt.z, min: -100, max: 100 },
        }),

        '💬 テキスト演出 (中央)': folder({
            '開始タイミング (0-1) ': { value: STARTUP_TRANSITION.textOverlay.showStartRatio, min: 0, max: 1, step: 0.05 },
            '終了タイミング (0-1) ': { value: STARTUP_TRANSITION.textOverlay.showEndRatio, min: 0, max: 1, step: 0.05 },
        }),

        '💡 Tips演出 (左上)': folder({
            '開始タイミング (0-1)': { value: (STARTUP_TRANSITION.textOverlay as any).tipsShowStartRatio ?? 0.1, min: 0, max: 1, step: 0.05 },
            '終了タイミング (0-1)': { value: (STARTUP_TRANSITION.textOverlay as any).tipsShowEndRatio ?? 0.4, min: 0, max: 1, step: 0.05 },
        }),

        '🌫️ フェード時間詳細': folder({
            'テキスト IN (秒)': { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
            'テキスト OUT (秒)': { value: 0.5, min: 0.1, max: 5.0, step: 0.1 },
            'Tips IN (秒)': { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
            'Tips OUT (秒)': { value: 0.5, min: 0.1, max: 5.0, step: 0.1 },
        }),
    });

    // 最新の設定値を保持するためのRef (useEffect内で最新値を参照するため)
    const configRef = useRef(transitionConfig);
    useEffect(() => {
        configRef.current = transitionConfig;

        // Sync fade settings to store
        setFadeSettings({
            textIn: transitionConfig['テキスト IN (秒)'],
            textOut: transitionConfig['テキスト OUT (秒)'],
            tipsIn: transitionConfig['Tips IN (秒)'],
            tipsOut: transitionConfig['Tips OUT (秒)'],
        });
    }, [transitionConfig, setFadeSettings]);

    useEffect(() => {
        if (!isStartupTransition || !controlsRef.current) return;

        const config = configRef.current;
        const {
            '全体所要時間 (ms)': totalDuration,
            'シーン切替位置 (0-1)': midpointRatio,
            '移動開始遅延 (ms)': cameraMoveDelay,
            '覚醒エフェクト時間 (ms)': awakeningDuration,
            'ズーム倍率': zoomMultiplier,
            '注視点 X': lookAtX, '注視点 Y': lookAtY, '注視点 Z': lookAtZ,
            '開始タイミング (0-1) ': textShowStartRatio,
            '終了タイミング (0-1) ': textShowEndRatio,
            '開始タイミング (0-1)': tipsShowStartRatio,
            '終了タイミング (0-1)': tipsShowEndRatio,
            'ズームインアニメーション': animateZoomIn,
            'デフォルト位置移動アニメーション': animateMoveToDefault,
        } = config;

        // LookAt再構成
        const lookAt = { x: lookAtX, y: lookAtY, z: lookAtZ };

        console.log("🚀 Startup Sequence Initiated", { duration: totalDuration });

        // タイマー管理用配列
        const timers: NodeJS.Timeout[] = [];

        // Helper to add timeline event
        const addEvent = (delay: number, callback: () => void) => {
            timers.push(setTimeout(callback, delay));
        };

        // --- TIMELINE DEFINITION ---

        // --- TIMELINE DEFINITION ---

        // 0-a. Tips Overlay (Early phase)
        const tipsStartTime = totalDuration * (tipsShowStartRatio as unknown as number);
        const tipsEndTime = totalDuration * (tipsShowEndRatio as unknown as number);

        addEvent(tipsStartTime, () => setStartupTips(true));
        addEvent(tipsEndTime, () => setStartupTips(false));

        // 0-b. Main Text Overlay (Late phase)
        const textStartTime = totalDuration * textShowStartRatio;
        const textEndTime = totalDuration * textShowEndRatio;

        addEvent(textStartTime, () => setStartupText(true));
        addEvent(textEndTime, () => setStartupText(false));

        // 1. Zoom & Scene Change (Midpoint)
        const midpointTime = totalDuration * midpointRatio;
        addEvent(midpointTime, () => {
            // シーン切り替えと覚醒エフェクト開始
            setCurrentScene('my_galaxy');
            setAwakening(true);

            // カメラ: ターゲットへズームイン
            controlsRef.current?.setLookAt(
                CAM_POS_ZOOM.x,
                CAM_POS_ZOOM.y,
                CAM_POS_ZOOM.z * zoomMultiplier,
                lookAt.x, lookAt.y, lookAt.z,
                animateZoomIn
            );

            // 1b. Camera Move to Default Position (after slight delay)
            addEvent(cameraMoveDelay, () => {
                controlsRef.current?.setLookAt(
                    CAM_POS_DEFAULT.x,
                    CAM_POS_DEFAULT.y,
                    CAM_POS_DEFAULT.z,
                    lookAt.x, lookAt.y, lookAt.z,
                    animateMoveToDefault
                );
            });

            // 1c. End Awakening Effect
            addEvent(awakeningDuration, () => {
                setAwakening(false);
            });
        });

        // 2. Complete Sequence
        addEvent(totalDuration, () => {
            setStartupTransition(false);
            setStartupText(false);
            setStartupTips(false);
            console.log("✨ Startup Sequence Completed");
        });

        // Cleanup function
        return () => {
            timers.forEach(clearTimeout);
        };
    }, [isStartupTransition, setCurrentScene, setAwakening, setStartupTransition, setStartupText, setStartupTips, controlsRef]);
}
