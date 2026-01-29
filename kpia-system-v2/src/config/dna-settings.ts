// ============================================================================
// DNA Settings
// ============================================================================

/**
 * DNAの形状設定
 */
export const DNA_GEOMETRY = {
    totalHeight: 1000,          // 全体の高さ
    radius: 40,                 // 螺旋の半径
    turns: 8,                   // 螺旋の回転数
    pointsPerStrand: 400,       // ストランドあたりのポイント数
    tubeRadius: 4,              // チューブの太さ
    tubeSegments: 8,            // チューブの円周分割数
} as const;

/**
 * DNAのアニメーション設定
 */
export const DNA_ANIMATION = {
    rotationSpeed: {
        default: 0.1,           // 通常時の回転速度
        decorative: 0.05,       // 装飾モード時の回転速度
        diving: 5.0,            // ダイビング時の回転速度
        dnaMode: 0.2,           // DNAモード時の回転速度
        spikeClockwise: 2.0,    // モード切り替え時の加速 (時計回り)
        spikeCounterClockwise: -2.0, // モード切り替え時の加速 (反時計回り)
    },
    pulseSpeed: 0.5,            // 液体金属の脈動速度
    liquidFluctuation: 0.05,    // 液体金属の揺らぎ係数
} as const;

/**
 * DNAのカラー設定
 */
export const DNA_COLORS = {
    base: '#ffffff',            // ベースカラー (白)
    silver: '#cccccc',          // メタリックシルバー
    hover: '#ffaa00',           // ホバー時のカラー (オレンジ)
    emissive: {
        default: '#000000',     // 通常時の発光色
        hover: '#ff4400',       // ホバー時の発光色 (赤茶色)
    },
    emissiveIntensity: {
        default: 0,
        hover: 0.5,
    },
    liquid: {
        silver: [0.8, 0.8, 0.8],    // 液体金属のシルバー成分 (RGB 0-1)
        orange: [1.0, 0.1, -0.5],   // 液体金属のオレンジ成分 (RGB 0-1)
    }
} as const;
