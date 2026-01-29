import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export const useAutoSave = () => {
    const {
        currentScene,
        viewMode,
        isDnaMode,
        selectedGalaxyId,
        saveCurrentState,
        user
    } = useStore();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 監視対象のステートが変更されたらタイマーをリセット
    useEffect(() => {
        if (!user) return; // ログインしていない場合は何もしない

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            console.log('Auto-saving state...');
            saveCurrentState();
        }, 3000); // 3秒後に保存

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentScene, viewMode, isDnaMode, selectedGalaxyId, saveCurrentState, user]);
};
