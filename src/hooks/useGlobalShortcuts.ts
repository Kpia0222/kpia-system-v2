import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useGlobalShortcuts() {
    const { setCurrentScene, currentScene } = useStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F7: Switch to Skill Screen
            if (e.key === 'F7') {
                e.preventDefault();
                if (currentScene !== 'skill') {
                    setCurrentScene('skill');
                } else {
                    // Toggle back to universe if already on skill screen
                    setCurrentScene('universe');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentScene, setCurrentScene]);
}
