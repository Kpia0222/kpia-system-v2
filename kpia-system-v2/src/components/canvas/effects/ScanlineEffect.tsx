import { Effect } from "postprocessing";
import { Uniform } from "three";
import { forwardRef, useMemo } from "react";

const shader = `
uniform float uTime;
uniform float uDensity;
uniform float uOpacity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // High frequency sine wave for scanlines
    // sin(uv.y * density - time * speed)
    float v = 0.5 + 0.5 * sin(uv.y * uDensity - uTime * 5.0);
    
    // We want the lines to be the DARK parts.
    // If v is 0 (bottom of wave), it should darken.
    // strength = (1 - v) * opacity.
    
    // To make lines sharper/thinner if desired:
    // v = smoothstep(..., v)
    // But user asked for "delicate". Simple sine is safest.
    
    float strength = (1.0 - v) * uOpacity;
    
    outputColor = vec4(inputColor.rgb * (1.0 - strength), inputColor.a);
}
`;

class ScanlineEffectImpl extends Effect {
    constructor({ density = 1.5, opacity = 0.05, speed = 1.0 } = {}) {
        super("ScanlineEffect", shader, {
            uniforms: new Map([
                ["uTime", new Uniform(0)],
                ["uDensity", new Uniform(density * 800.0)], // Scale density
                ["uOpacity", new Uniform(opacity)],
            ]),
        });
    }

    update(renderer: any, inputBuffer: any, deltaTime: number) {
        this.uniforms.get("uTime")!.value += deltaTime;
    }
}

export const Scanline = forwardRef(({ density = 1.5, opacity = 0.05, speed = 1.0 }: any, ref) => {
    const effect = useMemo(() => new ScanlineEffectImpl({ density, opacity, speed }), [density, opacity, speed]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});
