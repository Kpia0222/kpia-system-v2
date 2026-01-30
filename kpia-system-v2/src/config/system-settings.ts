// ============================================================================
// System Settings
// ============================================================================

/**
 * アニメーションと遷移の継続時間 (ミリ秒)
 */
export const TRANSITION_DURATIONS = {
    sceneTransition: 1500,      // シーン遷移全体
    loadingFade: 800,           // ローディング画面フェード
    quickFade: 300,             // クイックフェード
    cameraMove: 100,            // カメラ移動開始遅延
    awakeningEffect: 3000,      // 目覚めエフェクト
    initialDive: 2500,          // 初回ダイブアニメーション
} as const;

/**
 * システム全体のテーマカラー
 */
export const UI_COLORS = {
    primary: '#ff8800',         // メインアクセントカラー (オレンジ)
    secondary: '#ffffff',       // セカンダリカラー (白)
    background: '#000510',      // 背景色 (深い宇宙の色)
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        accent: '#ff8800',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    overlay: {
        dark: 'rgba(0, 0, 0, 0.8)',
        scanline: 'rgba(255, 136, 0, 0.2)', // オレンジ系のスキャンライン
    }
} as const;

/**
 * 視覚効果の設定
 */
export const VISUAL_SETTINGS = {
    scanlineSpeed: 0.5,         // 走査線の移動速度
    glitchIntensity: 0.5,       // グリッチエフェクトの強度
} as const;

/**
 * 浮遊フラグメントの設定
 */
export const FLOATING_FRAGMENTS = {
    speed: 1.5,
    rotationIntensity: 0.5,
    floatIntensity: 1,
    colors: {
        draft: '#ffaa00',       // ドラフト (オレンジ)
        linked: '#ffd700',      // リンクあり (ゴールド)
        emissive: {
            draft: '#ff4400',
            linked: '#ffaa00',
        }
    }
} as const;

/**
 * システムログの設定
 */
export const SYSTEM_LOG_SETTINGS = {
    typingSpeed: 0.05,          // 1行あたりの出現遅延 (秒)
    maxEntries: 50,             // 最大表示数
} as const;

/**
 * 時計コンポーネントの設定
 */
export const CLOCK_SETTINGS = {
    // ...
    size: 48,                   // デフォルトサイズ (px)
    strokeWidth: {
        frame: 1,
        hour: 2,
        minute: 1.5,
        second: 1,
        tick: 1,
    },
    handLength: {
        hour: 0.5,              // 半径に対する比率
        minute: 0.75,
        second: 0.85,
    }
} as const;
