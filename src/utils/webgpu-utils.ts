/**
 * WebGPU Support Detection Utility
 * 
 * Provides methods to check if the current browser supports WebGPU
 * and if the user has explicitly requested it via URL parameters.
 */

export const isWebGPUSupported = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.gpu) return false;

    try {
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter;
    } catch (e) {
        return false;
    }
};

/**
 * Checks if WebGPU should be enabled based on URL params or config.
 * URL param `?renderer=webgpu` takes precedence.
 */
export const shouldEnableWebGPU = () => {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    return params.get('renderer') === 'webgpu';
};
