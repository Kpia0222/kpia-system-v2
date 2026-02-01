// ============================================================================
// Environment Settings
// ============================================================================
import * as THREE from "three";

// ============================================================================
// Environment Lighting (page.tsx で使用)
// ============================================================================
export const ENVIRONMENT_LIGHTING = {
    preset: 'warehouse' as const,   // 'city' | 'warehouse' | 'sunset' | 'dawn' | 'night' | 'studio'
    environmentIntensity: 1,       // 環境光の強さ (0.5-2.0)
    ambientIntensity: 100,           // アンビエントライトの強さ
} as const;

// ============================================================================
// Post-Processing Effects (page.tsx で使用)
// ============================================================================
export const POST_PROCESSING = {
    bloom: {
        luminanceThreshold: 0.1,     // 発光の閾値 (高いほど明るい部分のみ発光)
        luminanceSmoothing: 0.9,     // 発光の滑らかさ
        intensity: 0.2,              // 発光の強さ
    },
    noise: {
        opacity: 0.02,               // ノイズの不透明度
    },
} as const;

// ============================================================================
// Mystic Glass Material Settings (MysticGlass.tsx で使用)
// ============================================================================
export const MYSTIC_GLASS_MATERIAL = {
    transmission: 1.0,               // 透過度 (0=不透明, 1=完全透過)
    thickness: 1.0,                  // 屈折による重厚感
    roughness: 0.02,                 // 表面の粗さ (0=鏡面, 1=マット)
    chromaticAberration: 0.2,        // 虹色の色収差（端のにじみ）
    iridescence: 5,                // 虹彩反射の強さ
    iridescenceIOR: 1.5,             // 虹彩の屈折率
    ior: 1.5,                        // ガラスの屈折率
    distortion: 0.15,                // 背景の歪み量
    anisotropy: 0.1,                 // 微細な方向性反射
    samples: 8,                      // レンダリング品質 (高いほど綺麗だが重い)
} as const;

// ============================================================================
// Mystic Glass Position & Float Settings (MyGalaxyScene.tsx で使用)
// ============================================================================
export const MYSTIC_GLASS_PLACEMENT = {
    position: [400, 200, -300] as [number, number, number],
    scale: 10,
    float: {
        speed: 0.5,                    // 浮遊速度
        rotationIntensity: 1,        // 回転の強さ
        floatIntensity: 10,           // 浮遊の強さ
    },
} as const;

// ============================================================================
// Mystic Glass Deformation Settings (うねうね変形)
// ============================================================================
export const MYSTIC_GLASS_DEFORMATION = {
    amplitude: 0.15,                   // 波の振幅（大きいほど変形が大きい）
    frequency: 2.0,                    // 波の周波数（大きいほど細かい波）
    speed: 1.5,                        // アニメーション速度
} as const;

// ============================================================================
// Mystic Glass Morphing Settings (幾何学形状へのモーフィング)
// ============================================================================
export const MYSTIC_GLASS_MORPHING = {
    cycleDuration: 15,                 // 全体のサイクル時間（秒）
    morphDuration: 2,                  // 遷移にかかる時間（秒）
    holdDuration: 3,                   // 幾何学形状を維持する時間（秒）
} as const;

// ============================================================================
// Observer Beacon Settings (観察者ビーコン)
// ============================================================================
export const OBSERVER_BEACON_SETTINGS = {
    // ジオメトリ設定
    geometry: {
        size: 8,                         // 八面体の基本サイズ
        glowScale: 1.5,                  // グロー外殻のスケール倍率
        glowSize: 1.2,                   // グロー外殻のジオメトリサイズ
    },
    // マテリアル設定
    material: {
        defaultColor: '#ff00c3',         // デフォルトカラー（オレンジ）
        emissiveIntensity: 0.2,          // 通常時の発光強度
        emissiveIntensityHover: 1.5,     // ホバー時の発光強度
        metalness: 0.3,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 0.5,
        iridescence: 0.8,
        iridescenceIOR: 1.3,
        opacity: 0.9,
        glowOpacity: 0.8,                // グロー外殻の不透明度
    },
    // ライト設定
    light: {
        intensity: 0.1,                  // 通常時のライト強度
        intensityHover: 3,               // ホバー時のライト強度
        distance: 2,                    // ライトの到達距離
    },
    // アニメーション設定
    animation: {
        floatSpeed: 2,                   // 浮遊アニメーション速度
        floatAmplitude: 0.5,             // 浮遊アニメーション振幅
        rotationSpeed: 0.01,             // 回転速度
        pulseSpeed: 3,                   // パルスアニメーション速度
        pulseAmplitude: 0.2,             // パルスアニメーション振幅
    },
} as const;

// ダミービーコンデータ（テスト用）
export const DUMMY_BEACONS = [
    {
        id: "beacon-001",
        userId: "cosmos_traveler",
        message: "この宇宙に辿り着いた最初の旅人より",
        position: [800, 30, -60] as [number, number, number],
    },
    {
        id: "beacon-002",
        userId: "void_walker_7",
        message: "星々の間を漂いながら、あなたの軌跡を見つけました。",
        position: [-90, 500, 40] as [number, number, number],
    },
    {
        id: "beacon-003",
        userId: "quantum_echo",
        message: "並行宇宙からのご挨拶。時空を超えて出会えて光栄です。",
        position: [50, -20, 600] as [number, number, number],
    },
];

// ============================================================================
// Meteor / Floating Objects
// ============================================================================

/**
 * 隕石 (浮遊物体) のデフォルト設定
 */
export const METEOR_DEFAULTS = {
    count: 5000,                // 隕石の数 (超・高密度銀河用に増量)
    minRadius: 50,              // 渦巻きの中心除外範囲
    maxRadius: 800,             // 渦巻きの最大半径
    color: '#ffaa00',           // 基本カラー (オレンジ)
    shapeType: 'tetrahedron' as const, // 形状タイプ
    size: {
        min: 0.5,
        max: 3.0,
    },
    rotationSpeed: {
        min: 0.1,
        max: 0.5,
    },
    floatSpeed: {
        min: 0.2,
        max: 1.0,
    }
} as const;

/**
 * カイパーベルト (外周リング) の設定
 */
export const KUIPER_BELT = {
    // 必要に応じて追加
    ringWidth: 100,
    density: 0.5,
} as const;

/**
 * 銀河クラスター (GalaxyCluster) の表示設定
 */
export const GALAXY_CLUSTER_SETTINGS = {
    colors: {
        unified: '#ff8800',     // 統一カラー (オレンジ)
        wireframe: '#FFFFFF',   // ワイヤーフレーム色
        points: '#FFFFFF',      // 点描の色
    },
    geometry: {
        size: 40,               // 基本サイズ
        detail: 0,              // 詳細度 (Polyhedronのdetail)
    },
    animation: {
        rotationSpeedX: 0.15,
        rotationSpeedY: 0.2,
        hoverScale: 1.2,
        dimmedScale: 0.6,
        scaleSpeed: 2.0, // lerp speed
    },
    material: {
        transmission: 1.0,
        opacity: 0.3,
        roughness: 0.0,
        metalness: 0.0,
        ior: 1.5,
        thickness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400] as [number, number],
        envMapIntensity: 2.0,
    }
} as const;