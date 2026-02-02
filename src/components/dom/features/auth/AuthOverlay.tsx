import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { UI_COLORS } from "@/config/system-settings";
import { CyberPanel } from "@/components/dom/shared/CyberPanel";
import { CyberButton } from "@/components/dom/shared/CyberButton";

export default function AuthOverlay() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const { setUser, setSession, loadFromCloud, closeMenu } = useStore();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMessage("Check email for confirmation.");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                if (data.user && data.session) {
                    setUser(data.user);
                    setSession(data.session);
                    await loadFromCloud();
                    closeMenu('auth'); // Close auth overlay on success
                    setMessage("AUTHENTICATION SUCCESSFUL");
                }
            }
        } catch (error: any) {
            setMessage(error.message || "AUTHENTICATION FAILED");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CyberPanel
            className="flex flex-col gap-4 w-full max-w-md"
            title={mode === 'signin' ? 'SYSTEM ACCESS' : 'NEW ID REGISTRY'}
        >
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px]" style={{ color: `${UI_COLORS.primary}B3` }}>IDENTITY (EMAIL)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/50 border p-2 font-mono text-white focus:outline-none focus:ring-1"
                        style={{
                            borderColor: `${UI_COLORS.primary}4D`,
                            // focus border handled via css or inline style conditional if needed, keeping simple
                        }}
                        placeholder="ENTER EMAIL"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px]" style={{ color: `${UI_COLORS.primary}B3` }}>PASSPHRASE</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/50 border p-2 font-mono text-white focus:outline-none focus:ring-1"
                        style={{ borderColor: `${UI_COLORS.primary}4D` }}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>

                {message && (
                    <div
                        className="text-[10px] font-mono border p-2"
                        style={{
                            color: UI_COLORS.primary,
                            borderColor: `${UI_COLORS.primary}33`,
                            backgroundColor: `${UI_COLORS.primary}0D`
                        }}
                    >
                        {`>> ${message}`}
                    </div>
                )}

                <CyberButton type="submit" isLoading={isLoading} className="mt-4">
                    {mode === 'signin' ? "INITIATE LINK" : "REGISTER ID"}
                </CyberButton>
            </form>

            {/* Footer / Toggle */}
            <div className="flex justify-center mt-2">
                <button
                    type="button"
                    onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setMessage("");
                    }}
                    className="font-mono text-xs underline"
                    style={{ color: `${UI_COLORS.primary}99` }}
                >
                    {mode === 'signin' ? "CREATE NEW IDENTITY" : "ACCESS EXISTING SYSTEM"}
                </button>
            </div>
        </CyberPanel>
    );
}
