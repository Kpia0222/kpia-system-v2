// ============================================================================
// Camera Settings - All camera configuration values
// ============================================================================

/**
 * Camera Properties (fov, far, near, etc.)
 * - fov: 視野角 (Field of View)
 * - near: 近クリップ面
 * - far: 遠クリップ面
 */
export const CAMERA_PROPERTIES = {
    fov: 65,
    near: 0.1,
    far: 2000,
} as const;

/**
 * Initial camera position for Canvas [x, y, z]
 */
export const CAMERA_INITIAL_POSITION: [number, number, number] = [0, 200, 400];

// ============================================================================
// Scene-specific Camera Positions
// ============================================================================

/**
 * Initial look-at target for startup dive animation
 */
export const STARTUP_LOOK_AT = { x: -100, y: -2000, z: 1500 };

/**
 * Camera position after startup dive completes
 */
export const CAM_POS_START = { x: 100, y: 400, z: -300 };

/**
 * Camera zoom position (DNA analysis mode, etc.)
 */
export const CAM_POS_ZOOM = { x: 0, y: 0, z: 100 };

/**
 * Default camera position for my_galaxy scene
 */
export const CAM_POS_DEFAULT = { x: 500, y: 150, z: 800 };

// ============================================================================
// Camera Controls Constraints
// ============================================================================

/**
 * CameraControls (drei) の動作を制御する設定
 * 
 * パラメータ説明:
 * - minDistance: 原点からの最小距離 (ワールド単位)
 * - maxDistance: 原点からの最大距離 (ワールド単位)
 * - smoothTime: カメラ移動の滑らかさ (秒、小さいほど即座に反応)
 * - enabled: ユーザー操作の有効/無効
 * - minPolarAngle: 縦回転の上限 (ラジアン、0 = 真上)
 * - maxPolarAngle: 縦回転の下限 (ラジアン、π = 真下)
 */
export const CAMERA_CONSTRAINTS = {
    /**
     * Start Scene (スタート画面)
     * 装飾的なDNA表示のみ、ユーザー操作無効
     */
    start: {
        minDistance: 10,      // カメラが原点に近づける最小距離
        maxDistance: 2000,    // カメラが原点から離れられる最大距離
        smoothTime: 1.5,      // カメラ移動のスムース時間（秒）
        enabled: false,       // false = ユーザー操作無効（自動演出のみ）
    },

    /**
     * My Galaxy Scene (自分の銀河)
     * DNAを中心に回転・ズーム可能
     */
    myGalaxy: {
        minDistance: 200,     // DNAに近づける最小距離
        maxDistance: 1200,    // DNAから離れられる最大距離
        smoothTime: {
            default: 1.0,     // 通常時のスムース時間
            diving: 0.3,      // ダイビング中の高速移動（より即座に反応）
        },
    },

    /**
     * Universe Scene (宇宙俯瞰)
     * 銀河群を眺める視点
     * ※ minDistance === maxDistance の場合、ズーム固定
     */
    universe: {
        minDistance: 1200,    // 銀河群からの最小距離
        maxDistance: 1200,    // 銀河群からの最大距離（固定ズーム）
        smoothTime: 0.3,      // 高速なカメラ反応
    },

    /**
     * Galaxy Interior Scene (銀河内部)
     * 惑星を自由な角度から観察可能
     */
    galaxyInterior: {
        minDistance: 10,              // 惑星に極限まで近づける
        maxDistance: 700,            // 銀河内部の表示範囲
        minPolarAngle: 0,            // 真上からの角度（0 = 真上OK）
        maxPolarAngle: Math.PI,      // 真下からの角度（π = 真下OK）
    },
} as const;