import { useState, useEffect } from "react";
import { api, FirewallRule, FirewallStatus } from "../lib/tauri";

export function Firewall() {
    const [status, setStatus] = useState<FirewallStatus | null>(null);
    const [rules, setRules] = useState<FirewallRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockForm, setBlockForm] = useState({ port: "", protocol: "TCP", name: "" });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [statusData, rulesData] = await Promise.all([
                api.getFirewallStatus(),
                api.getFirewallRules(),
            ]);
            setStatus(statusData);
            setRules(rulesData);
        } catch (error) {
            console.error("Failed to fetch firewall data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBlockPort = async () => {
        if (!blockForm.port || !blockForm.name) return;
        setActionLoading(true);
        try {
            await api.blockPort(parseInt(blockForm.port), blockForm.protocol, blockForm.name);
            setShowBlockModal(false);
            setBlockForm({ port: "", protocol: "TCP", name: "" });
            await fetchData();
        } catch (error) {
            console.error("Failed to block port:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveRule = async (ruleName: string) => {
        if (!confirm(`Remove firewall rule "${ruleName}"?`)) return;
        setActionLoading(true);
        try {
            await api.removeFirewallRule(ruleName);
            await fetchData();
        } catch (error) {
            console.error("Failed to remove rule:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnableLogging = async () => {
        setActionLoading(true);
        try {
            await api.enableFirewallLogging();
            alert("Firewall logging enabled for all profiles");
        } catch (error) {
            console.error("Failed to enable logging:", error);
        } finally {
            setActionLoading(false);
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
                        <span className="material-symbols-outlined text-cyan-400 text-3xl">shield</span>
                        Firewall
                    </h1>
                    <p className="text-slate-400 text-sm">Manage Windows Firewall rules and settings</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleEnableLogging}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                        Enable Logging
                    </button>
                    <button
                        onClick={() => setShowBlockModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">block</span>
                        Block Port
                    </button>
                </div>
            </div>

            {/* Profile Status */}
            <div className="grid grid-cols-3 gap-4">
                <StatusCard label="Domain" enabled={status?.domain_enabled ?? false} />
                <StatusCard label="Private" enabled={status?.private_enabled ?? false} />
                <StatusCard label="Public" enabled={status?.public_enabled ?? false} />
            </div>

            {/* Rules Table */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Firewall Rules (First 50)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-700">
                                <th className="pb-3 font-medium">Name</th>
                                <th className="pb-3 font-medium">Direction</th>
                                <th className="pb-3 font-medium">Action</th>
                                <th className="pb-3 font-medium">Protocol</th>
                                <th className="pb-3 font-medium">Port</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.slice(0, 20).map((rule, index) => (
                                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                    <td className="py-3 text-white truncate max-w-[200px]" title={rule.name}>
                                        {rule.name}
                                    </td>
                                    <td className="py-3 text-slate-300">{rule.direction}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs ${rule.action === 'Allow' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {rule.action}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-300">{rule.protocol}</td>
                                    <td className="py-3 text-slate-300 font-mono">{rule.local_port}</td>
                                    <td className="py-3">
                                        <span className={`w-2 h-2 rounded-full inline-block ${rule.enabled ? 'bg-green-400' : 'bg-slate-500'}`}></span>
                                    </td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => handleRemoveRule(rule.name)}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Block Port Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Block Inbound Port</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Rule Name</label>
                                <input
                                    type="text"
                                    value={blockForm.name}
                                    onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                                    placeholder="e.g., Block SMB"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Port</label>
                                    <input
                                        type="number"
                                        value={blockForm.port}
                                        onChange={(e) => setBlockForm({ ...blockForm, port: e.target.value })}
                                        placeholder="445"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Protocol</label>
                                    <select
                                        value={blockForm.protocol}
                                        onChange={(e) => setBlockForm({ ...blockForm, protocol: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="TCP">TCP</option>
                                        <option value="UDP">UDP</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBlockPort}
                                disabled={actionLoading || !blockForm.port || !blockForm.name}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white rounded-lg"
                            >
                                Block Port
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusCard({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className={`rounded-xl p-4 border ${enabled
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
            <p className="text-sm text-slate-400">{label} Network</p>
            <div className="flex items-center gap-2 mt-1">
                <span className={`material-symbols-outlined ${enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {enabled ? 'shield' : 'shield_locked'}
                </span>
                <p className={`font-bold ${enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                </p>
            </div>
        </div>
    );
}
