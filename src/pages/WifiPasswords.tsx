import { useState, useEffect } from "react";
import { api, WifiProfile } from "../lib/tauri";

export function WifiPasswords() {
    const [wifiProfiles, setWifiProfiles] = useState<WifiProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string | null>>({});
    const [loadingPassword, setLoadingPassword] = useState<string | null>(null);
    const [copiedSsid, setCopiedSsid] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profiles = await api.getWifiProfiles();
                setWifiProfiles(profiles);
            } catch (error) {
                console.error("Failed to fetch WiFi profiles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRevealPassword = async (ssid: string) => {
        if (revealedPasswords[ssid] !== undefined) {
            const updated = { ...revealedPasswords };
            delete updated[ssid];
            setRevealedPasswords(updated);
            return;
        }

        setLoadingPassword(ssid);
        try {
            const profile = await api.getWifiPassword(ssid);
            setRevealedPasswords(prev => ({
                ...prev,
                [ssid]: profile.password,
            }));
        } catch (error) {
            console.error("Failed to get password:", error);
            setRevealedPasswords(prev => ({
                ...prev,
                [ssid]: null,
            }));
        } finally {
            setLoadingPassword(null);
        }
    };

    const copyToClipboard = (text: string, ssid: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSsid(ssid);
        setTimeout(() => setCopiedSsid(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    WiFi Passwords
                </h1>
                <p className="text-slate-400 text-sm">View saved WiFi network passwords</p>
            </div>

            {/* WiFi Profiles List */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                {wifiProfiles.length === 0 ? (
                    <p className="text-slate-400 text-sm">No saved WiFi profiles found</p>
                ) : (
                    <div className="space-y-3">
                        {wifiProfiles.map((profile) => (
                            <div key={profile.ssid} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{profile.ssid}</p>
                                        {revealedPasswords[profile.ssid] !== undefined && (
                                            <p className="text-sm text-slate-400 font-mono">
                                                {revealedPasswords[profile.ssid] || "No password"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {revealedPasswords[profile.ssid] && (
                                        <button
                                            onClick={() => copyToClipboard(revealedPasswords[profile.ssid]!, profile.ssid)}
                                            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                                        >
                                            {copiedSsid === profile.ssid ? "Copied!" : "Copy"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRevealPassword(profile.ssid)}
                                        disabled={loadingPassword === profile.ssid}
                                        className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white rounded-md transition-colors"
                                    >
                                        {loadingPassword === profile.ssid
                                            ? "Loading..."
                                            : revealedPasswords[profile.ssid] !== undefined
                                                ? "Hide"
                                                : "Show Password"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-xs text-slate-500 mt-4">
                    ⚠️ Some passwords may require Administrator privileges to view
                </p>
            </section>
        </div>
    );
}
