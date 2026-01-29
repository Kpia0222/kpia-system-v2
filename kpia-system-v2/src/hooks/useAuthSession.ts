import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";

export function useAuthSession() {
    const { setSession, setUser, syncProfile, fetchMusicTracks } = useStore();

    useEffect(() => {
        const supabase = createClient();

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                syncProfile();
                fetchMusicTracks();
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                syncProfile();
            }
        });

        return () => subscription.unsubscribe();
    }, [setSession, setUser, syncProfile]);
}
