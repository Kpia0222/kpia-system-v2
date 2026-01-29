// ============================================================================
// Environment Settings
// ============================================================================
import * as THREE from "three";

/**
 * 隕石 (浮遊物体) のデフォルト設定
 */
export const METEOR_DEFAULTS = {
    count: 1000,                // 隕石の数
    minRadius: 400,             // 最小配置半径
    maxRadius: 500,             // 最大配置半径
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
