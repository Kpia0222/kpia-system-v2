"use client";

import { Canvas, CanvasProps } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { shouldEnableWebGPU, isWebGPUSupported } from "@/utils/webgpu-utils";
import { POST_PROCESSING } from "@/config/environment-settings";

// Extend Three.js types to include WebGPU
// Note: In newer three versions, WebGPURenderer might be exported differently
// @ts-ignore
import { WebGLRenderer } from "three";

export interface KpiaCanvasProps extends Omit<CanvasProps, 'gl'> {
    children: React.ReactNode;
    onRendererChange?: (isWebGPU: boolean) => void;
}

export function KpiaCanvas({ children, onRendererChange, ...props }: KpiaCanvasProps) {
    const [isWebGPU, setIsWebGPU] = useState(false);
    const [renderer, setRenderer] = useState<any>(null);

    useEffect(() => {
        const initRenderer = async () => {
            const requested = shouldEnableWebGPU() || POST_PROCESSING.renderer.useWebGPU;
            const supported = await isWebGPUSupported();

            if (requested && supported) {
                console.log("🚀 Initializing WebGPU Renderer...");
                // Create WebGPURenderer instance
                // @ts-ignore - Types might not be fully updated for experimental features
                const gpuRenderer = new WebGPURenderer({ antialias: true });
                setRenderer(gpuRenderer);
                setIsWebGPU(true);
                onRendererChange?.(true);
            } else {
                console.log("🎨 Initializing WebGL Renderer (Default)...");
                setIsWebGPU(false);
                onRendererChange?.(false);
                // For WebGL, we don't need to pass a custom renderer instance,
                // R3F handles it automatically if 'gl' prop is undefined.
                setRenderer(undefined);
            }
        };

        initRenderer();
    }, [onRendererChange]);

    // If explicit renderer is created (WebGPU), pass it. Otherwise pass undefined (WebGL default)
    const glProps = renderer ? { gl: renderer } : {};

    return (
        <Canvas
            {...props}
            {...glProps}
        >
            {children}
        </Canvas>
    );
}
