"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";

// ============================================================================
// useTuning - 音楽史の逆行オーディオエンジン
// ============================================================================

/**
 * 12平均律の周波数比率 (A4 = 440Hz を基準)
 * 2^(n/12) で各半音の比率を計算
 */
const SEMITONE_RATIOS = Array.from({ length: 12 }, (_, i) => Math.pow(2, i / 12));

/**
 * erosionLevel に基づいてピッチとデチューンを計算
 * 
 * erosionLevel の意味:
 * - 0.0: 現代 (12-TET 標準チューニング)
 * - 0.3: 19世紀 (微小なピッチ揺れ)
 * - 0.5: 中世 (ピタゴラス音律風の微分音)
 * - 0.7: 古代 (自然倍音列への回帰)
 * - 1.0: カオス (原始的な周波数の混沌)
 */
export interface TuningState {
    /** 基準周波数からの偏差 (cents: 1 semitone = 100 cents) */
    detuneAmount: number;
    /** ピッチ乗数 (1.0 = 変化なし) */
    pitchMultiplier: number;
    /** 現在の音律名 */
    tuningName: string;
    /** デチューン範囲 (セント単位) */
    detuneRange: number;
    /** ランダムデチューン適用するか */
    applyRandomDetune: boolean;
    /** 周波数揺らぎの強度 (0-1) */
    vibratoIntensity: number;
}

/**
 * erosionLevel から音律システムを導出
 */
function getTuningName(erosion: number): string {
    if (erosion < 0.1) return "12-TET (Equal Temperament)";
    if (erosion < 0.3) return "Well-Tempered";
    if (erosion < 0.5) return "Meantone";
    if (erosion < 0.7) return "Pythagorean";
    if (erosion < 0.9) return "Just Intonation";
    return "Primordial Chaos";
}

/**
 * 音楽史の逆行フック
 * 
 * @returns TuningState - 現在の erosionLevel に基づいた音律パラメータ
 */
export function useTuning(): TuningState {
    const erosionLevel = useStore((state) => state.erosionLevel);

    return useMemo(() => {
        // Erosion level を 0-1 にクランプ
        const erosion = Math.max(0, Math.min(1, erosionLevel));

        // デチューン量計算 (erosionが高いほど大きなデチューン)
        // 0: ±0 cents, 0.5: ±25 cents, 1.0: ±100 cents
        const detuneRange = erosion * 100;

        // ピッチ乗数 (erosionが高いほど不安定)
        // 基本は 1.0、高erosionで微小な変動
        const pitchVariation = erosion > 0.7
            ? (Math.random() - 0.5) * 0.02 * erosion
            : 0;
        const pitchMultiplier = 1.0 + pitchVariation;

        // ランダムデチューン適用閾値
        const applyRandomDetune = erosion > 0.3;

        // ビブラート強度
        const vibratoIntensity = erosion * 0.8;

        // 実際のデチューン量 (ランダム要素付き)
        const detuneAmount = applyRandomDetune
            ? (Math.random() - 0.5) * detuneRange * 2
            : 0;

        return {
            detuneAmount,
            pitchMultiplier,
            tuningName: getTuningName(erosion),
            detuneRange,
            applyRandomDetune,
            vibratoIntensity,
        };
    }, [erosionLevel]);
}

/**
 * 周波数を計算 (A4 = 440Hz 基準)
 * 
 * @param semitone - A4からの半音数 (0 = A4, 12 = A5, -12 = A3)
 * @param tuning - TuningState から取得
 * @returns Hz単位の周波数
 */
export function calculateFrequency(semitone: number, tuning: TuningState): number {
    const baseFreq = 440; // A4
    const ratio = Math.pow(2, semitone / 12);
    const detuneMultiplier = Math.pow(2, tuning.detuneAmount / 1200); // cents to ratio

    return baseFreq * ratio * tuning.pitchMultiplier * detuneMultiplier;
}

/**
 * 12平均律からの偏差を計算 (セント単位)
 * 
 * @param targetRatio - 目標周波数比率
 * @param nearestSemitone - 最も近い半音
 * @returns セント単位の偏差
 */
export function calculateDeviation(targetRatio: number, nearestSemitone: number): number {
    const equalTempRatio = Math.pow(2, nearestSemitone / 12);
    return 1200 * Math.log2(targetRatio / equalTempRatio);
}
