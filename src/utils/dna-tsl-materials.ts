/**
 * DNA TSL マテリアル — WebGPU 用
 * 
 * DnaModel.tsx の GLSL ベース `onBeforeCompile` + `ShaderMaterial` を
 * TSL (Three Shading Language) + `MeshPhysicalNodeMaterial` / `NodeMaterial` に移行。
 * 
 * WebGPU レンダラー使用時のみインポート・使用される。
 */

import { MeshPhysicalNodeMaterial, NodeMaterial } from "three/webgpu";
import {
    uniform, float, vec3, vec4,
    positionLocal, normalLocal, modelWorldMatrix,
    sin, abs, mix, smoothstep, sub,
    mx_noise_float, uv,
    varyingProperty,
} from "three/tsl";
import {
    AdditiveBlending, DoubleSide, FrontSide,
} from "three";

// ============================================================================
// Constants (from original GLSL shaders)
// ============================================================================

/** ノイズスケール (元 GLSL: transformed * 0.05) */
const NOISE_SCALE = 0.05;
/** ノイズ振幅 (元 GLSL: n * 1.5) */
const NOISE_AMPLITUDE = 1.5;
/** Silver カラー */
const COLOR_SILVER = vec3(0.8, 0.8, 0.8);
/** Orange カラー */
const COLOR_ORANGE = vec3(1.0, 0.1, -0.5);
/** フェードのスケール (元 GLSL: halfHeight * 0.6) */
const FADE_SCALE = 0.6;

// ============================================================================
// Bridge Constants
// ============================================================================

/** ブリッジ Silver カラー */
const BRIDGE_COLOR_SILVER = vec3(0.2, 0.2, 0.2);
/** ブリッジ Orange カラー */
const BRIDGE_COLOR_ORANGE = vec3(4.0, 1.0, 0.0);
/** パルス輝度 */
const BRIDGE_PULSE_BRIGHTNESS = 0.5;

// ============================================================================
// Shared uniform type
// ============================================================================

/** 外部から .value を更新するためのインターフェース */
export interface DnaStrandUniforms {
    uTime: { value: number };
    uMinY: { value: number };
    uMaxY: { value: number };
}

// ============================================================================
// DNA Strand Material (TSL)
// ============================================================================

export interface DnaStrandMaterialResult {
    material: MeshPhysicalNodeMaterial;
}

/**
 * DNA ストランド用 NodeMaterial を作成する。
 * 
 * 元の GLSL を忠実に移植:
 * - 頂点: simplex noise で法線方向に変形
 * - フラグメント: Y 座標ベースの Silver→Orange グラデーション + エミッシブ + フェード
 * 
 * @param uniformRefs - 外部から .value を更新される参照オブジェクト
 */
export function createDnaStrandNodeMaterial(
    uniformRefs: DnaStrandUniforms
): MeshPhysicalNodeMaterial {
    // @ts-expect-error — TSL uniform() accepts { value } objects at runtime
    const uTime = uniform(uniformRefs.uTime);
    // @ts-expect-error — TSL uniform() accepts { value } objects at runtime
    const uMinY = uniform(uniformRefs.uMinY);
    // @ts-expect-error — TSL uniform() accepts { value } objects at runtime
    const uMaxY = uniform(uniformRefs.uMaxY);

    const mat = new MeshPhysicalNodeMaterial();
    mat.metalness = 1.0;
    mat.roughness = 0.15;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.1;
    mat.iridescence = 0.8;
    mat.iridescenceIOR = 1.3;
    mat.transparent = true;
    mat.side = FrontSide;

    // -- Vertex: Noise Deformation --
    // 元 GLSL: float n = snoise(transformed * 0.05 + vec3(0.0, uTime * 0.5, 0.0));
    //          transformed += normal * (n * 1.5);
    const noiseInput = positionLocal.mul(float(NOISE_SCALE)).add(
        vec3(0.0, uTime.mul(0.5), 0.0)
    );
    const noiseValue = mx_noise_float(noiseInput);
    const displacement = normalLocal.mul(noiseValue.mul(float(NOISE_AMPLITUDE)));
    mat.positionNode = positionLocal.add(displacement);

    // -- Varying: World Position for fragment --
    const worldPos4 = modelWorldMatrix.mul(vec4(mat.positionNode, 1.0));
    const worldPosXYZ = worldPos4.xyz;
    const vWorldPos = varyingProperty("vec3", "vWorldPos");
    vWorldPos.assign(worldPosXYZ);

    const yProgress = smoothstep(uMinY, uMaxY, worldPosXYZ.y);
    const vYProgress = varyingProperty("float", "vYProgress");
    vYProgress.assign(yProgress);

    // -- Fragment: Color Gradient --
    // 元 GLSL: vec3 finalColor = mix(colorSilver, colorOrange, vYProgress);
    const gradientColor = mix(COLOR_SILVER, COLOR_ORANGE, vYProgress);
    mat.colorNode = gradientColor;

    // エミッシブ: mix(0.1, 1.0, vYProgress)
    const emissiveStrength = mix(float(0.1), float(1.0), vYProgress);
    mat.emissiveNode = gradientColor.mul(emissiveStrength).mul(0.8);

    // -- Fragment: Distance Fade --
    const halfHeight = sub(uMaxY, uMinY).mul(0.5);
    const distY = abs(vWorldPos.y);
    const fadeAlpha = sub(float(1.0), smoothstep(float(0.0), halfHeight.mul(float(FADE_SCALE)), distY));
    mat.opacityNode = fadeAlpha;

    return mat;
}

// ============================================================================
// Bridge Material (TSL)
// ============================================================================

export interface BridgeMaterialResult {
    material: NodeMaterial;
    uniforms: { uTime: { value: number } };
}

/**
 * ブリッジ用 NodeMaterial を作成する。
 * 
 * 元の ShaderMaterial (raw GLSL) を忠実に移植:
 * - 頂点: envelope + sway + jitter による波動アニメーション
 * - フラグメント: パルス + Silver→Orange グラデーション + フェード
 */
export function createBridgeNodeMaterial(
    fadeRadius: number
): BridgeMaterialResult {
    const uTimeUniform = uniform(float(0));
    const uFadeRadius = uniform(float(fadeRadius));

    const mat = new NodeMaterial();
    mat.transparent = true;
    mat.blending = AdditiveBlending;
    mat.depthTest = false;
    mat.side = DoubleSide;

    // -- Vertex: Wave Animation --
    const posX = positionLocal.x;
    const envelope = sin(posX.mul(3.14159));
    const sway = sin(posX.mul(6.28).add(uTimeUniform.mul(2.0)));
    const jitter = sin(posX.mul(20.0).sub(uTimeUniform.mul(5.0))).mul(0.3);
    const wave = sway.add(jitter).mul(envelope);

    const newPos = vec3(
        positionLocal.x,
        positionLocal.y.add(wave.mul(5.0)),
        positionLocal.z.add(wave.mul(2.0))
    );
    mat.positionNode = newPos;

    // -- Varying: World Position --
    const worldPos4 = modelWorldMatrix.mul(vec4(newPos, 1.0));
    const worldPosXYZ = worldPos4.xyz;
    const vWorldPos = varyingProperty("vec3", "vBridgeWorldPos");
    vWorldPos.assign(worldPosXYZ);

    // UV varying for pulse
    const vUvX = varyingProperty("float", "vBridgeUvX");
    vUvX.assign(uv().x);

    // -- Fragment: Pulse + Gradient + Fade --
    const pulse = float(0.5).add(
        float(0.5).mul(sin(vUvX.mul(10.0).sub(uTimeUniform.mul(3.0))))
    );
    const gradientT = smoothstep(uFadeRadius.negate(), uFadeRadius, vWorldPos.y);
    const baseColor = mix(BRIDGE_COLOR_SILVER, BRIDGE_COLOR_ORANGE, gradientT);
    const finalColor = baseColor.add(vec3(BRIDGE_PULSE_BRIGHTNESS).mul(pulse));

    const distY = abs(vWorldPos.y);
    const fade = sub(float(1.0), smoothstep(float(0.0), uFadeRadius.mul(float(FADE_SCALE)), distY));

    mat.colorNode = finalColor;
    mat.opacityNode = fade;

    return {
        material: mat,
        uniforms: { uTime: uTimeUniform },
    };
}
