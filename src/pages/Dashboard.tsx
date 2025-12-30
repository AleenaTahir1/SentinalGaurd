import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, DashboardStats, EventLog, SystemInfo } from "../lib/tauri";

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsData, eventsData, sysInfo] = await Promise.all([
                api.getDashboardStats(),
                api.getEventLogs(),
                api.getSystemInfo(),
            ]);
            setStats(statsData);
            setRecentEvents(eventsData.slice(0, 5));
            setSystemInfo(sysInfo);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const isSecure = stats?.is_secure ?? true;
    const blockedCount = stats?.blocked_devices ?? 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full p-6 flex flex-col gap-6">
            {/* Header with Shield Status */}
            <div className={`rounded-2xl p-6 border ${isSecure
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20'
                : 'bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isSecure ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                        <svg className={`w-8 h-8 ${isSecure ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={`text-2xl font-bold ${isSecure ? 'text-green-400' : 'text-red-400'}`}>
                            {isSecure ? 'System Secure' : `${blockedCount} Threats Detected`}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {isSecure ? 'All connected devices are trusted' : 'Untrusted devices require attention'}
                        </p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-slate-500">Uptime</p>
                        <p className="text-lg font-mono text-white">{systemInfo?.uptime_hours?.toFixed(1) ?? '--'}h</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Connected Devices"
                    value={stats?.total_devices ?? 0}
                    icon="usb"
                    onClick={() => navigate('/devices')}
                />
                <StatCard
                    label="Trusted"
                    value={stats?.trusted_devices ?? 0}
                    icon="verified_user"
                    color="green"
                />
                <StatCard
                    label="Blocked Threats"
                    value={stats?.blocked_threats ?? 0}
                    icon="block"
                    color="red"
                />
                <StatCard
                    label="Total Scans"
                    value={stats?.total_scans ?? 0}
                    icon="search"
                />
            </div>

            {/* System Overview + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Quick View */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">System Overview</h2>
                        <button
                            onClick={() => navigate('/system')}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                            View Details →
                        </button>
                    </div>
                    <div className="space-y-3">
                        <SystemRow label="Computer" value={`${systemInfo?.computer_name} (${systemInfo?.username})`} />
                        <SystemRow label="Operating System" value={systemInfo?.os_name ?? 'Unknown'} />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">RAM Usage</p>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500 rounded-full transition-all"
                                        style={{ width: `${systemInfo ? ((systemInfo.total_ram_gb - systemInfo.available_ram_gb) / systemInfo.total_ram_gb) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {systemInfo?.available_ram_gb?.toFixed(1)} GB free of {systemInfo?.total_ram_gb} GB
                                </p>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Disk (C:)</p>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${systemInfo ? ((systemInfo.disk_total_gb - systemInfo.disk_free_gb) / systemInfo.disk_total_gb) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {systemInfo?.disk_free_gb?.toFixed(0)} GB free of {systemInfo?.disk_total_gb?.toFixed(0)} GB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Activity</h2>
                        <button
                            onClick={() => navigate('/logs')}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                            View All →
                        </button>
                    </div>
                    {recentEvents.length === 0 ? (
                        <p className="text-sm text-slate-500">No recent activity</p>
                    ) : (
                        <div className="space-y-2">
                            {recentEvents.map((event) => (
                                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
                                    <div className={`w-2 h-2 rounded-full ${event.level === 'BLOCK' ? 'bg-red-400' :
                                        event.level === 'WARN' ? 'bg-yellow-400' :
                                            event.level === 'ERROR' ? 'bg-orange-400' : 'bg-cyan-400'
                                        }`} />
                                    <p className="text-sm text-slate-300 truncate flex-1">{event.message}</p>
                                    <p className="text-xs text-slate-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickLink label="WiFi Passwords" icon="wifi" onClick={() => navigate('/wifi')} />
                <QuickLink label="Startup Programs" icon="bolt" onClick={() => navigate('/startup')} />
                <QuickLink label="Network Info" icon="language" onClick={() => navigate('/network')} />
                <QuickLink label="Security Logs" icon="terminal" onClick={() => navigate('/logs')} />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                <p>Last Boot: {systemInfo?.last_boot ?? 'Unknown'}</p>
                <p>SentinelGuard v1.0.0</p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color = 'cyan', onClick }: {
    label: string; value: number; icon: string; color?: string; onClick?: () => void
}) {
    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-500/10',
        green: 'text-green-400 bg-green-500/10',
        red: 'text-red-400 bg-red-500/10',
    };
    return (
        <div
            className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 ${onClick ? 'cursor-pointer hover:bg-slate-800 transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 mb-2">
                <span className={`material-symbols-outlined text-lg ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[0]}`}>{icon}</span>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <p className="text-xs text-slate-400">{label}</p>
        </div>
    );
}

function SystemRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-sm text-white truncate ml-2 max-w-[200px]" title={value}>{value}</span>
        </div>
    );
}

function QuickLink({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 flex items-center gap-2 transition-colors text-left"
        >
            <span className="material-symbols-outlined text-cyan-400 text-lg">{icon}</span>
            <span className="text-sm text-slate-300">{label}</span>
        </button>
    );
}
