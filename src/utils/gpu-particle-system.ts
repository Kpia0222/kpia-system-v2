/**
 * GPU Particle System using Three.js TSL (Three Shading Language)
 * 
 * CPU 上の useFrame ループを GPU コンピュートシェーダーに移行し、
 * パーティクルの位置・回転・スケールを GPU 上で直接計算するためのユーティリティ。
 * 
 * WebGPU レンダラー使用時のみ有効。WebGL 時は null を返す。
 */

import {
    InstancedMesh, Object3D, Vector3,
    InstancedBufferAttribute, DynamicDrawUsage,
    type BufferGeometry, type Material,
} from "three";
import {
    Fn, instanceIndex, float, vec3, sin, cos,
    storage, uniform, compute, instancedArray,
} from "three/tsl";

// ============================================================================
// Types
// ============================================================================

/** パーティクル1個分の初期パラメータ */
interface ParticleInitData {
    /** 初期位置 */
    position: Vector3;
    /** 初期回転 (Euler angles) */
    rotation: Vector3;
    /** 回転速度 (axis speed multipliers) */
    rotationSpeed: Vector3;
    /** 基本スケール */
    scale: number;
    /** 明滅速度 */
    twinkleSpeed: number;
    /** 明滅位相オフセット */
    twinkleOffset: number;
    /** 色 (RGB, 0-1) */
    color: Vector3;
    /** 輝度倍率 */
    brightness: number;
}

export interface GpuParticleSystemConfig {
    /** パーティクルの初期データ配列 */
    particles: ParticleInitData[];
    /** ジオメトリ */
    geometry: BufferGeometry;
    /** マテリアル */
    material: Material;
}

export interface GpuParticleSystem {
    /** シーンに追加する InstancedMesh */
    mesh: InstancedMesh;
    /** 毎フレーム呼び出すコンピュートノード */
    computeNode: ReturnType<typeof compute>;
    /** リソース破棄 */
    dispose: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/** 明滅アニメーションのスケール振幅 */
const TWINKLE_AMPLITUDE = 0.2;
/** 明滅アニメーションのベーススケール */
const TWINKLE_BASE = 0.8;
/** 全体の回転速度 (Y軸) */
const GLOBAL_ROTATION_SPEED = 0.02;

// ============================================================================
// Factory
// ============================================================================

/**
 * GPU ベースのパーティクルシステムを構築する。
 * WebGPU レンダラーでのみ使用可能。
 * 
 * @returns GpuParticleSystem | null (データが空の場合)
 */
export function createGpuParticleSystem(
    config: GpuParticleSystemConfig,
): GpuParticleSystem | null {
    const { particles, geometry, material } = config;
    const count = particles.length;

    if (count === 0) return null;

    // ---------------------------------------------------------------
    // 1. Storage Buffers via TSL instancedArray (GPU 上に常駐)
    //    instancedArray() は内部で StorageInstancedBufferAttribute を
    //    生成するため、直接 import する必要がない。
    // ---------------------------------------------------------------

    const positionBuffer = instancedArray(count, "vec3");
    const rotationBuffer = instancedArray(count, "vec3");
    const rotSpeedBuffer = instancedArray(count, "vec3");
    // scaleParams: vec3(baseScale, twinkleSpeed, twinkleOffset)
    const scaleParamsBuffer = instancedArray(count, "vec3");

    // 初期データを CPU 側から書き込み（1回のみ）
    for (let i = 0; i < count; i++) {
        const p = particles[i];
        const i3 = i * 3;

        positionBuffer.value.array[i3] = p.position.x;
        positionBuffer.value.array[i3 + 1] = p.position.y;
        positionBuffer.value.array[i3 + 2] = p.position.z;

        rotationBuffer.value.array[i3] = p.rotation.x;
        rotationBuffer.value.array[i3 + 1] = p.rotation.y;
        rotationBuffer.value.array[i3 + 2] = p.rotation.z;

        rotSpeedBuffer.value.array[i3] = p.rotationSpeed.x;
        rotSpeedBuffer.value.array[i3 + 1] = p.rotationSpeed.y;
        rotSpeedBuffer.value.array[i3 + 2] = p.rotationSpeed.z;

        scaleParamsBuffer.value.array[i3] = p.scale;
        scaleParamsBuffer.value.array[i3 + 1] = p.twinkleSpeed;
        scaleParamsBuffer.value.array[i3 + 2] = p.twinkleOffset;
    }

    // ---------------------------------------------------------------
    // 2. InstancedMesh の構築
    // ---------------------------------------------------------------
    const mesh = new InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);

    // 色バッファ (GPU compute ではなく、静的に1回だけ設定)
    const colorData = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const p = particles[i];
        const i3 = i * 3;
        colorData[i3] = p.color.x * p.brightness;
        colorData[i3 + 1] = p.color.y * p.brightness;
        colorData[i3 + 2] = p.color.z * p.brightness;
    }
    mesh.instanceColor = new InstancedBufferAttribute(colorData, 3);

    // 初期行列を設定 (Compute が走る前の初回フレーム保護)
    const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
        const p = particles[i];
        dummy.position.copy(p.position);
        dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // レイキャスト無効化
    mesh.raycast = () => { /* noop */ };

    // ---------------------------------------------------------------
    // 3. Compute Shader (TSL)
    // ---------------------------------------------------------------
    const uTime = uniform(float(0));

    // Read-only buffers for compute
    const posRead = positionBuffer.toReadOnly();
    const rotRead = rotationBuffer.toReadOnly();
    const rotSpdRead = rotSpeedBuffer.toReadOnly();
    const scaleRead = scaleParamsBuffer.toReadOnly();

    // Instance matrix as writable storage
    const instanceMatrixStorage = storage(mesh.instanceMatrix, "mat4", count);

    const computeUpdate = Fn(() => {
        const idx = instanceIndex;

        // Storage buffer から読み出し
        const basePos = posRead.element(idx);
        const baseRot = rotRead.element(idx);
        const rotSpeed = rotSpdRead.element(idx);
        const scaleParams = scaleRead.element(idx);

        // time-based animation
        const t = uTime;

        // 回転の計算
        const rx = baseRot.x.add(rotSpeed.x.mul(t));
        const ry = baseRot.y.add(rotSpeed.y.mul(t));
        const rz = baseRot.z.add(rotSpeed.z.mul(t));

        // スケール計算 (明滅)
        const baseScale = scaleParams.x;
        const twinkleSpd = scaleParams.y;
        const twinkleOff = scaleParams.z;
        const scaleFactor = baseScale.mul(
            sin(t.mul(twinkleSpd).add(twinkleOff)).mul(float(TWINKLE_AMPLITUDE)).add(float(TWINKLE_BASE))
        );

        // 全体回転 (Y軸) — basePos を Y軸回転させる
        const globalAngle = t.mul(float(GLOBAL_ROTATION_SPEED));
        const cosA = cos(globalAngle);
        const sinA = sin(globalAngle);
        const rotatedX = basePos.x.mul(cosA).add(basePos.z.mul(sinA));
        const rotatedZ = basePos.x.mul(sinA.negate()).add(basePos.z.mul(cosA));

        // 回転行列の要素を計算 (ZYX Euler order)
        const cx = cos(rx), sx = sin(rx);
        const cy = cos(ry), sy = sin(ry);
        const cz = cos(rz), sz = sin(rz);

        // Rotation matrix from Euler angles (ZYX convention, same as Three.js default)
        const m00 = cy.mul(cz).mul(scaleFactor);
        const m01 = cx.mul(sz).add(sx.mul(sy).mul(cz)).mul(scaleFactor).negate();
        const m02 = sx.mul(sz).sub(cx.mul(sy).mul(cz)).mul(scaleFactor);
        const m10 = cy.mul(sz).mul(scaleFactor).negate();
        const m11 = cx.mul(cz).sub(sx.mul(sy).mul(sz)).mul(scaleFactor);
        const m12 = sx.mul(cz).add(cx.mul(sy).mul(sz)).mul(scaleFactor).negate();
        const m20 = sy.mul(scaleFactor);
        const m21 = sx.mul(cy).mul(scaleFactor);
        const m22 = cx.mul(cy).mul(scaleFactor);

        // InstanceMatrix に直接書き込み (4x4 column-major)
        const mat = instanceMatrixStorage.element(idx);

        // Column-major layout: mat4 element access
        // column 0
        mat.x.assign(vec3(m00, m10, m20));
        // column 1
        mat.y.assign(vec3(m01, m11, m21));
        // column 2
        mat.z.assign(vec3(m02, m12, m22));
        // column 3 (translation)
        mat.w.assign(vec3(rotatedX, basePos.y, rotatedZ));

    })().compute(count);

    // ---------------------------------------------------------------
    // 4. Public API
    // ---------------------------------------------------------------
    return {
        mesh,
        computeNode: computeUpdate,
        dispose: () => {
            geometry.dispose();
            if ("dispose" in material) material.dispose();
            mesh.dispose();
        },
    };
}
