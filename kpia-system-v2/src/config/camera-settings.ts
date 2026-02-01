// ============================================================================
// カメラ設定 - すべてのカメラ関連の設定値
// ============================================================================

/**
 * カメラの基本プロパティ
 * 
 * - fov: 視野角 (Field of View) - 値が大きいほど広角レンズ効果
 * - near: 近クリップ面 - これより手前のオブジェクトは描画されない
 * - far: 遠クリップ面 - これより奥のオブジェクトは描画されない
 */
export const CAMERA_PROPERTIES = {
    fov: 65,                    // 視野角（度）- 人間の視野に近い値
    near: 0.1,                  // 近クリップ面（ワールド単位）
    far: 2000,                  // 遠クリップ面（ワールド単位）
} as const;

/**
 * Canvasの初期カメラ位置 [x, y, z]
 * アプリ起動時のカメラの初期位置
 */
export const CAMERA_INITIAL_POSITION: [number, number, number] = [0, 200, 400];

// ============================================================================
// シーン別カメラ位置設定
// ============================================================================

/**
 * 【初回ダイブアニメーション】カメラの初期視点ターゲット
 * 
 * アプリ起動直後、カメラはこの位置を見つめた状態から始まり、
 * CAM_POS_START へ向かってゆっくりズームインする。
 * 
 * - x: 横方向のオフセット（負の値 = 左寄り）
 * - y: 縦方向のオフセット（大きな負の値 = 下から見上げる演出）
 * - z: 奥行き方向（正の値 = 手前から見る）
 */
export const STARTUP_LOOK_AT = { x: -100, y: -2000, z: 1500 };

/**
 * 【スタート画面】ダイブアニメーション完了後のカメラ位置
 * 
 * 初回ダイブが完了した時点でカメラが到達する位置。
 * スタート画面でDNAモデルを斜め上から見下ろす視点。
 * 「メニューからスタート画面に戻る」時もこの位置にリセットされる。
 * 
 * - x: 右に100（DNAを斜めから見る）
 * - y: 上に400（俯瞰気味の視点）
 * - z: 手前に-300（DNAの背後側から見る）
 */
export const CAM_POS_START = { x: 100, y: 400, z: -300 };

/**
 * 【スタートボタン押下時】遷移中のズーム位置
 * 
 * スタートボタンを押した後、一度DNAに急接近する際のカメラ位置。
 * ここでシーンが 'start' → 'my_galaxy' に切り替わる。
 * その後 CAM_POS_DEFAULT へスムーズに移動する。
 * 
 * - x, y: 原点（DNA中心）
 * - z: 100（DNAにかなり近い位置）
 */
export const CAM_POS_ZOOM = { x: 0, y: 0, z: 100 };

/**
 * 【DNA銀河シーン】デフォルトのカメラ位置
 * 
 * スタートボタン遷移完了後、通常プレイ中のカメラ位置。
 * DNA銀河全体を見渡せる俯瞰視点。
 * 
 * - x: 500（右側から見る）
 * - y: 150（やや上から見下ろす）
 * - z: 800（適度な距離で全体を把握）
 */
export const CAM_POS_DEFAULT = { x: 500, y: 150, z: 800 };

// ============================================================================
// スタートアップトランジション設定（スタート画面 → DNA銀河）
// ============================================================================

export const STARTUP_TRANSITION = {
    // --- Timing Settings ---
    totalDuration: 6000,      // トランジション全体の時間(ms)
    midpointRatio: 0.5,       // シーン切り替えタイミング (0.0-1.0)
    cameraMoveDelay: 100,     // ズーム後移動開始遅延(ms)
    awakeningDuration: 3000,  // 覚醒エフェクト時間(ms)

    // --- Camera Settings ---
    zoomMultiplier: 1.5,      // ズームイン時のZ倍率
    lookAt: { x: 0, y: 0, z: 0 }, // 注視点
    animateZoomIn: false,     // ズームイン時アニメーション有無
    animateMoveToDefault: true, // デフォルト位置移動時アニメーション有無

    // --- Polyhedra Settings ---
    showOverlay: true,
    polyhedraOverlay: {
        countPerShape: 50,    // 各形状の数
        opacity: 0.3,         // 不透明度
        centerClearanceY: 4,  // 中央除外範囲
        spreadY: 25,          // Y軸範囲
        spreadZ: 20,          // Z軸範囲
    },

    // --- Text & Tips Settings (Separated) ---
    textOverlay: {
        enabled: true,
        fadeAnimationDuration: 1000, // フェード時間(基準値)

        // Tips (前半)
        tipsShowStartRatio: 0.1,
        tipsShowEndRatio: 0.4,

        // Text (後半)
        showStartRatio: 0.6,
        showEndRatio: 0.9,
    },
} as const;

// ============================================================================
// カメラコントロール制約設定
// ============================================================================

/**
 * CameraControls (drei) の動作を制御する詳細設定
 * 
 * 【共通パラメータ説明】
 * - minDistance: ズームイン限界（原点からの最小距離、ワールド単位）
 * - maxDistance: ズームアウト限界（原点からの最大距離、ワールド単位）
 * - smoothTime: カメラ追従の滑らかさ（秒）
 *               → 小さい値 = キビキビ動く、大きい値 = ゆったり動く
 * - enabled: ユーザーのマウス/タッチ操作を受け付けるか
 *            → false の場合、プログラムからのみカメラ制御可能
 * - minPolarAngle: 縦回転の上限（ラジアン）
 *                  → 0 = 真上から見下ろせる
 * - maxPolarAngle: 縦回転の下限（ラジアン）
 *                  → Math.PI = 真下から見上げられる
 */
export const CAMERA_CONSTRAINTS = {
    /**
     * スタート画面 (Start Scene)
     * 
     * 【目的】装飾的なDNA表示のみ。ユーザー操作は無効。
     * 【動作】自動演出（ダイブアニメーション）のみ許可。
     */
    start: {
        minDistance: 10,          // ズームイン限界（近くまで寄れる）
        maxDistance: 2000,        // ズームアウト限界（遠くまで離れられる）
        smoothTime: 1.5,          // ゆったりとしたカメラ移動（演出向け）
        enabled: false,           // ユーザー操作を無効化
    },

    /**
     * 自分の銀河シーン (My Galaxy Scene)
     * 
     * 【目的】DNA銀河を自由に探索。
     * 【動作】マウスドラッグで回転、ホイールでズーム可能。
     */
    myGalaxy: {
        minDistance: 200,         // DNAに近づける限界（これ以上寄れない）
        maxDistance: 1200,        // DNAから離れられる限界（全体を見渡せる）
        smoothTime: {
            default: 1.0,         // 通常時：滑らかな追従
            diving: 0.3,          // ダイビング中：即座に反応
        },
    },

    /**
     * 宇宙俯瞰シーン (Universe Scene)
     * 
     * 【目的】複数の銀河を一望。
     * 【動作】ズーム固定（minDistance === maxDistance）。
     */
    universe: {
        minDistance: 1200,        // ズーム固定値
        maxDistance: 1200,        // ズーム固定値（上と同じ）
        smoothTime: 0.3,          // 高速なカメラ反応
    },

    /**
     * 銀河内部シーン (Galaxy Interior Scene)
     * 
     * 【目的】選択した銀河の内部を探索。
     * 【動作】全方位から観察可能（真上・真下OK）。
     */
    galaxyInterior: {
        minDistance: 10,          // 惑星に極限まで近づける
        maxDistance: 700,         // 銀河内部全体を見渡せる距離
        minPolarAngle: 0,         // 真上からの視点を許可
        maxPolarAngle: Math.PI,   // 真下からの視点を許可
    },
} as const;