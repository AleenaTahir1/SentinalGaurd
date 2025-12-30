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

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    System Info
                </h1>
                <p className="text-slate-400 text-sm">Computer hardware and operating system details</p>
            </div>

            {/* System Info Cards */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                {systemInfo && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoCard label="Computer Name" value={systemInfo.computer_name} />
                        <InfoCard label="Operating System" value={systemInfo.os_name} />
                        <InfoCard label="OS Version" value={systemInfo.os_version} />
                        <InfoCard label="Processor" value={systemInfo.cpu_name} />
                        <InfoCard label="CPU Cores" value={systemInfo.cpu_cores.toString()} />
                        <InfoCard label="Total RAM" value={`${systemInfo.total_ram_gb} GB`} />
                    </div>
                )}
            </section>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm text-white font-medium truncate" title={value}>{value}</p>
        </div>
    );
}
