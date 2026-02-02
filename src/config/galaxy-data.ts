"use client";

// ----------------------------------------------------------------------
// Galaxy Data Definitions
// 銀河データを一元管理するための設定ファイル
// ----------------------------------------------------------------------

export type GalaxyType = 'order' | 'ring' | 'chaos' | 'spiral';

export interface MeteorConfig {
    count: number;
    color: string;
    shapeType: 'tetrahedron' | 'box' | 'octahedron';
    minRadius: number;
    maxRadius: number;
}

export interface GalaxyData {
    id: string;
    name: string;
    type: GalaxyType;
    position: [number, number, number];
    rotation?: [number, number, number];
    starCount: number;
    erosionLevel: number;
    meteorConfig?: MeteorConfig;
}

export const GALAXIES_DATA: GalaxyData[] = [
    {
        id: 'g-order',
        name: 'WESTERN ORDER',
        type: 'order',
        position: [400, 50, 200],
        rotation: [0, 0, 0],
        starCount: 2000,
        erosionLevel: 0.05,
        meteorConfig: {
            count: 30,
            color: '#ffaa00',
            shapeType: 'tetrahedron',
            minRadius: 50,
            maxRadius: 80
        }
    },
    {
        id: 'g-ring',
        name: 'MAQAM SYSTEM',
        type: 'ring',
        position: [-500, 150, -300],
        rotation: [Math.PI / 6, 0, Math.PI / 4],
        starCount: 3500,
        erosionLevel: 0.35,
        meteorConfig: {
            count: 25,
            color: '#00ff88',
            shapeType: 'octahedron',
            minRadius: 50,
            maxRadius: 75
        }
    },
    {
        id: 'g-chaos',
        name: 'TABOO SECTOR',
        type: 'chaos',
        position: [200, -100, -600],
        rotation: [0, 0, 0],
        starCount: 5000,
        erosionLevel: 0.92,
        meteorConfig: {
            count: 40,
            color: '#ff0055',
            shapeType: 'box',
            minRadius: 55,
            maxRadius: 90
        }
    },
    {
        id: 'g-africa',
        name: 'AFRICAN POLYRHYTHM',
        type: 'ring',
        position: [600, -50, -100],
        rotation: [0, Math.PI / 4, 0],
        starCount: 3000,
        erosionLevel: 0.15,
        meteorConfig: {
            count: 25,
            color: '#ffaa00',
            shapeType: 'octahedron',
            minRadius: 50,
            maxRadius: 75
        }
    },
    {
        id: 'g-irish',
        name: 'CELTIC SPIRAL',
        type: 'chaos',
        position: [-600, 0, 500],
        rotation: [Math.PI / 2, 0, 0],
        starCount: 2500,
        erosionLevel: 0.25,
        meteorConfig: {
            count: 25,
            color: '#00ff88',
            shapeType: 'octahedron',
            minRadius: 50,
            maxRadius: 75
        }
    },
    {
        id: 'g-spiral',
        name: 'ANDROMEDA VORTEX',
        type: 'spiral',
        position: [0, 200, 0],
        rotation: [Math.PI / 3, 0, 0],
        starCount: 4000,
        erosionLevel: 0.50,
        meteorConfig: {
            count: 30,
            color: '#0088ff',
            shapeType: 'octahedron',
            minRadius: 50,
            maxRadius: 80
        }
    }
];

// 後方互換性のためのエイリアス
export const galaxies = GALAXIES_DATA;
