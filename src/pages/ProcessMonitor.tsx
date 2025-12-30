import { useState, useEffect } from "react";
import { api, ProcessInfo, ServiceInfo } from "../lib/tauri";

export function ProcessMonitor() {
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [services, setServices] = useState<ServiceInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'processes' | 'services'>('processes');

    const fetchData = async () => {
        try {
            const [processData, serviceData] = await Promise.all([
                api.getHighMemoryProcesses(),
                api.getCriticalServices(),
            ]);
            setProcesses(processData);
            setServices(serviceData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleKillProcess = async (id: number, name: string) => {
        if (!confirm(`Kill process "${name}" (ID: ${id})? This may cause data loss.`)) return;
        setActionLoading(`kill-${id}`);
        try {
            await api.killProcess(id);
            await fetchData();
        } catch (error) {
            console.error("Failed to kill process:", error);
            alert("Failed to kill process. It may require administrator privileges.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestartService = async (name: string) => {
        if (!confirm(`Restart service "${name}"?`)) return;
        setActionLoading(`restart-${name}`);
        try {
            await api.restartService(name);
            await fetchData();
        } catch (error) {
            console.error("Failed to restart service:", error);
            alert("Failed to restart service. It may require administrator privileges.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleStartService = async (name: string) => {
        setActionLoading(`start-${name}`);
        try {
            await api.startService(name);
            await fetchData();
        } catch (error) {
            console.error("Failed to start service:", error);
            alert("Failed to start service. It may require administrator privileges.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-3xl">monitor_heart</span>
                        Process Monitor
                    </h1>
                    <p className="text-slate-400 text-sm">Monitor high-memory processes and critical services</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('processes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'processes'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    High Memory Processes ({processes.length})
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'services'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Critical Services ({services.length})
                </button>
            </div>

            {/* Processes Tab */}
            {activeTab === 'processes' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Processes Using &gt;100 MB Memory
                    </h2>
                    <div className="space-y-2">
                        {processes.map((proc) => (
                            <div key={proc.id} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">memory</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{proc.name}</p>
                                        <p className="text-xs text-slate-500">PID: {proc.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className={`font-mono text-sm ${proc.memory_mb > 500 ? 'text-red-400' : 'text-cyan-400'}`}>
                                            {proc.memory_mb.toFixed(0)} MB
                                        </p>
                                        <p className="text-xs text-slate-500">Memory</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm text-white">{proc.cpu_percent.toFixed(1)}s</p>
                                        <p className="text-xs text-slate-500">CPU Time</p>
                                    </div>
                                    <button
                                        onClick={() => handleKillProcess(proc.id, proc.name)}
                                        disabled={actionLoading === `kill-${proc.id}`}
                                        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 disabled:bg-slate-600 text-white text-xs rounded transition-colors"
                                    >
                                        {actionLoading === `kill-${proc.id}` ? 'Killing...' : 'Kill'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {processes.length === 0 && (
                            <p className="text-slate-500 text-center py-4">No high-memory processes found</p>
                        )}
                    </div>
                    <p className="text-xs text-yellow-400 mt-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Killing processes may cause data loss. Use with caution.
                    </p>
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Critical Windows Services
                    </h2>
                    <div className="space-y-2">
                        {services.map((svc) => (
                            <div key={svc.name} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${svc.status === 'Running' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        <span className={`material-symbols-outlined ${svc.status === 'Running' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {svc.status === 'Running' ? 'check_circle' : 'error'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{svc.display_name}</p>
                                        <p className="text-xs text-slate-500">{svc.name} • {svc.start_type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs ${svc.status === 'Running'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {svc.status}
                                    </span>
                                    {svc.status === 'Running' ? (
                                        <button
                                            onClick={() => handleRestartService(svc.name)}
                                            disabled={actionLoading === `restart-${svc.name}`}
                                            className="px-3 py-1.5 bg-yellow-600/80 hover:bg-yellow-500 disabled:bg-slate-600 text-white text-xs rounded transition-colors"
                                        >
                                            {actionLoading === `restart-${svc.name}` ? 'Restarting...' : 'Restart'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStartService(svc.name)}
                                            disabled={actionLoading === `start-${svc.name}`}
                                            className="px-3 py-1.5 bg-green-600/80 hover:bg-green-500 disabled:bg-slate-600 text-white text-xs rounded transition-colors"
                                        >
                                            {actionLoading === `start-${svc.name}` ? 'Starting...' : 'Start'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                        Monitoring: Windows Update, BITS, Windows Defender, Firewall, Event Log, Print Spooler, Time Service
                    </p>
                </div>
            )}
        </div>
    );
}
