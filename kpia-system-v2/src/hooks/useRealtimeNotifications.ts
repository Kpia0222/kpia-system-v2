"use client";

import { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeNotification {
    id: string;
    type: 'friend_request' | 'beacon_placed' | 'friend_online';
    message: string;
    timestamp: Date;
    data?: Record<string, unknown>;
}

/**
 * Hook for Supabase Realtime notifications
 * Subscribes to friend requests and other social events
 */
export function useRealtimeNotifications() {
    const { user, displayId } = useStore();
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) => {
        const newNotification: RealtimeNotification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Keep last 10

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
        }, 5000);
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    useEffect(() => {
        if (!user) return;

        const supabase = createClient();

        // Subscribe to changes in game_state that might contain friend requests
        // Using a broadcast channel for real-time social events
        const newChannel = supabase.channel(`social:${user.id}`, {
            config: {
                broadcast: { self: false },
            },
        });

        newChannel
            .on('broadcast', { event: 'friend_request' }, (payload) => {
                addNotification({
                    type: 'friend_request',
                    message: `Explorer ${payload.payload.from_display_id || 'Unknown'} wants to connect!`,
                    data: payload.payload,
                });
            })
            .on('broadcast', { event: 'beacon_placed' }, (payload) => {
                addNotification({
                    type: 'beacon_placed',
                    message: `New beacon placed in your universe!`,
                    data: payload.payload,
                });
            })
            .on('broadcast', { event: 'friend_online' }, (payload) => {
                addNotification({
                    type: 'friend_online',
                    message: `Explorer ${payload.payload.display_id || 'Unknown'} is now online!`,
                    data: payload.payload,
                });
            })
            .subscribe((status) => {
                console.log('Realtime channel status:', status);
            });

        setChannel(newChannel);

        return () => {
            if (newChannel) {
                supabase.removeChannel(newChannel);
            }
        };
    }, [user, addNotification]);

    // Helper to broadcast events
    const broadcast = useCallback(async (event: string, payload: Record<string, unknown>) => {
        if (!channel) return;
        await channel.send({
            type: 'broadcast',
            event,
            payload,
        });
    }, [channel]);

    return {
        notifications,
        addNotification,
        clearNotification,
        broadcast,
    };
}
