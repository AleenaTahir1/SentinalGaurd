import { useState, useEffect } from "react";
import { api, SystemInfo as SystemInfoType } from "../lib/tauri";

export function SystemInfo() {
    const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sysInfo = await api.getSystemInfo();
                setSystemInfo(sysInfo);
            } catch (error) {
                console.error("Failed to fetch system info:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    const ramUsedPercent = systemInfo
        ? ((systemInfo.total_ram_gb - systemInfo.available_ram_gb) / systemInfo.total_ram_gb) * 100
        : 0;
    const diskUsedPercent = systemInfo
        ? ((systemInfo.disk_total_gb - systemInfo.disk_free_gb) / systemInfo.disk_total_gb) * 100
        : 0;

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-3xl">computer</span>
                        System Information
                    </h1>
                    <p className="text-slate-400 text-sm">Hardware specifications and system status</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">System Uptime</p>
                    <p className="text-xl font-mono text-cyan-400">{systemInfo?.uptime_hours?.toFixed(1)}h</p>
                </div>
            </div>

            {/* User & Computer Info */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Identity</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard label="Computer Name" value={systemInfo?.computer_name ?? ''} icon="dns" />
                    <InfoCard label="Username" value={systemInfo?.username ?? ''} icon="person" />
                    <InfoCard label="Domain" value={systemInfo?.domain ?? ''} icon="domain" />
                    <InfoCard label="Last Boot" value={systemInfo?.last_boot ?? ''} icon="schedule" />
                </div>
            </div>

            {/* Operating System */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Operating System</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">OS Name</p>
                        <p className="text-lg text-white font-medium">{systemInfo?.os_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Version</p>
                            <p className="text-sm text-white font-mono">{systemInfo?.os_version}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Build</p>
                            <p className="text-sm text-white font-mono">{systemInfo?.os_build}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CPU & Memory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">memory</span>
                        Processor
                    </h2>
                    <p className="text-white font-medium mb-4">{systemInfo?.cpu_name}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{systemInfo?.cpu_cores}</p>
                            <p className="text-xs text-slate-500">Cores</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{systemInfo?.cpu_threads}</p>
                            <p className="text-xs text-slate-500">Threads</p>
                        </div>
                    </div>
                </div>

                {/* Memory */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">sd_card</span>
                        Memory (RAM)
                    </h2>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Used</span>
                            <span className="text-white font-mono">
                                {(systemInfo!.total_ram_gb - systemInfo!.available_ram_gb).toFixed(1)} / {systemInfo?.total_ram_gb} GB
                            </span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${ramUsedPercent > 80 ? 'bg-red-500' : ramUsedPercent > 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                                style={{ width: `${ramUsedPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-green-400">{systemInfo?.available_ram_gb?.toFixed(1)}</p>
                            <p className="text-xs text-slate-500">GB Available</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-white">{ramUsedPercent.toFixed(0)}%</p>
                            <p className="text-xs text-slate-500">Usage</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disk Storage */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">hard_drive</span>
                    Storage (C: Drive)
                </h2>
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Used Space</span>
                        <span className="text-white font-mono">
                            {(systemInfo!.disk_total_gb - systemInfo!.disk_free_gb).toFixed(0)} / {systemInfo?.disk_total_gb?.toFixed(0)} GB
                        </span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${diskUsedPercent > 90 ? 'bg-red-500' : diskUsedPercent > 75 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${diskUsedPercent}%` }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">{systemInfo?.disk_total_gb?.toFixed(0)}</p>
                        <p className="text-xs text-slate-500">GB Total</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-emerald-400">{systemInfo?.disk_free_gb?.toFixed(0)}</p>
                        <p className="text-xs text-slate-500">GB Free</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">{diskUsedPercent.toFixed(0)}%</p>
                        <p className="text-xs text-slate-500">Used</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500 text-lg">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-white font-medium truncate" title={value}>{value}</p>
            </div>
        </div>
    );
}
