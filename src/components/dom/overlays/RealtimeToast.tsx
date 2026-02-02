"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRealtimeNotifications, RealtimeNotification } from "@/hooks/useRealtimeNotifications";

/**
 * RealtimeToast - Displays real-time notifications in a corner
 * Shows friend requests, beacon placements, and other social events
 */
export function RealtimeToast() {
    const { notifications, clearNotification } = useRealtimeNotifications();

    const getIcon = (type: RealtimeNotification['type']) => {
        switch (type) {
            case 'friend_request':
                return '👤';
            case 'beacon_placed':
                return '📡';
            case 'friend_online':
                return '⚡';
            default:
                return '🔔';
        }
    };

    const getColor = (type: RealtimeNotification['type']) => {
        switch (type) {
            case 'friend_request':
                return 'border-cyan-500/50 bg-cyan-500/10';
            case 'beacon_placed':
                return 'border-[#ff8800]/50 bg-[#ff8800]/10';
            case 'friend_online':
                return 'border-green-500/50 bg-green-500/10';
            default:
                return 'border-white/50 bg-white/10';
        }
    };

    return (
        <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`pointer-events-auto max-w-[300px] p-3 border ${getColor(notification.type)} backdrop-blur-md font-mono`}
                        onClick={() => clearNotification(notification.id)}
                    >
                        <div className="flex items-start gap-2">
                            <span className="text-lg">{getIcon(notification.type)}</span>
                            <div className="flex-1">
                                <div className="text-[10px] text-white/50 tracking-widest mb-1">
                                    {notification.type.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="text-sm text-white">
                                    {notification.message}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                }}
                                className="text-white/50 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
