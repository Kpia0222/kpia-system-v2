"use client";

import { Canvas, CanvasProps } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { shouldEnableWebGPU, isWebGPUSupported } from "@/utils/webgpu-utils";
import { POST_PROCESSING } from "@/config/environment-settings";

export interface KpiaCanvasProps extends Omit<CanvasProps, 'gl'> {
    children: React.ReactNode;
    onRendererChange?: (isWebGPU: boolean) => void;
}

export function KpiaCanvas({ children, onRendererChange, ...props }: KpiaCanvasProps) {
    const [useWebGPU, setUseWebGPU] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const checkRenderer = async () => {
            const requested = shouldEnableWebGPU() || POST_PROCESSING.renderer.useWebGPU;
            const supported = await isWebGPUSupported();

            if (requested && supported) {
                console.log("🚀 WebGPU Renderer will be initialized...");
                setUseWebGPU(true);
                onRendererChange?.(true);
            } else {
                console.log("🎨 Initializing WebGL Renderer (Default)...");
                setUseWebGPU(false);
                onRendererChange?.(false);
            }
            setReady(true);
        };

        checkRenderer();
    }, [onRendererChange]);

    /**
     * R3F v9 推奨: async ファクトリ関数で WebGPURenderer を初期化。
     * Canvas が canvas 要素を渡してくるので、それを使ってレンダラーを生成する。
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createWebGPURenderer = useCallback(async (canvas: any) => {
        const { WebGPURenderer } = await import("three/webgpu");
        const renderer = new WebGPURenderer({ canvas, antialias: true });
        await renderer.init();
        console.log("✅ WebGPU Renderer initialized successfully.");
        return renderer;
    }, []);

    // レンダラー検出結果が出るまで待機
    if (!ready) return null;

    return (
        <Canvas
            {...props}
            gl={useWebGPU ? createWebGPURenderer : undefined}
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        >
            {children}
        </Canvas>
    );
}
