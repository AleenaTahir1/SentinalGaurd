import { useState, useEffect } from "react";
import { api, NetworkInfo, SystemInfo } from "../lib/tauri";

export function Network() {
    const [networks, setNetworks] = useState<NetworkInfo[]>([]);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [wifiInfo, setWifiInfo] = useState<[string, string] | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [networkData, sysInfo, wifi] = await Promise.all([
                api.getNetworkInfo(),
                api.getSystemInfo(),
                api.getConnectedWifi(),
            ]);
            setNetworks(networkData);
            setSystemInfo(sysInfo);
            setWifiInfo(wifi);
        } catch (error) {
            console.error("Failed to fetch network info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    const primaryNetwork = networks[0];
    const isWifi = primaryNetwork?.adapter_name?.toLowerCase().includes('wi-fi') ||
        primaryNetwork?.adapter_name?.toLowerCase().includes('wireless');
    const signalPercent = wifiInfo ? parseInt(wifiInfo[1]) : 0;

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-3xl">language</span>
                        Network
                    </h1>
                    <p className="text-slate-400 text-sm">Network adapters and connection details</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Connection Status Hero */}
            {primaryNetwork ? (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-6">
                        {/* Status Icon */}
                        <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-green-400 text-4xl">{isWifi ? 'wifi' : 'lan'}</span>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">check</span>
                            </div>
                        </div>

                        {/* Connection Info */}
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-green-400 mb-1">Connected</p>
                            {wifiInfo ? (
                                <>
                                    <p className="text-lg text-white font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-cyan-400 text-xl">wifi</span>
                                        {wifiInfo[0]}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-xs text-slate-500">Signal:</p>
                                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${signalPercent > 70 ? 'bg-green-500' :
                                                    signalPercent > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${signalPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono">{wifiInfo[1]}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg text-white font-medium">{primaryNetwork.adapter_name}</p>
                                    <p className="text-sm text-slate-400 mt-1">{systemInfo?.domain || 'Ethernet Connection'}</p>
                                </>
                            )}
                        </div>

                        {/* IP Address Display */}
                        <div
                            className="bg-slate-900/50 rounded-xl p-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                            onClick={() => copyToClipboard(primaryNetwork.ip_address, 'ip')}
                        >
                            <p className="text-xs text-slate-500 mb-1">Your IP Address</p>
                            <p className="text-2xl font-mono text-cyan-400">{primaryNetwork.ip_address}</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">content_copy</span>
                                {copiedField === 'ip' ? 'Copied!' : 'Click to copy'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl p-6 border border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-400 text-3xl">wifi_off</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-red-400">Not Connected</p>
                            <p className="text-sm text-slate-400">No active network adapters found</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Network Details Grid */}
            {primaryNetwork && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NetworkCard
                        icon="router"
                        label="Gateway"
                        value={primaryNetwork.gateway}
                        onCopy={() => copyToClipboard(primaryNetwork.gateway, 'gateway')}
                        copied={copiedField === 'gateway'}
                    />
                    <NetworkCard
                        icon="dns"
                        label="DNS Servers"
                        value={primaryNetwork.dns_servers}
                        onCopy={() => copyToClipboard(primaryNetwork.dns_servers, 'dns')}
                        copied={copiedField === 'dns'}
                    />
                    <NetworkCard
                        icon="lan"
                        label="Subnet"
                        value={primaryNetwork.subnet_mask}
                        onCopy={() => copyToClipboard(primaryNetwork.subnet_mask, 'subnet')}
                        copied={copiedField === 'subnet'}
                    />
                    <NetworkCard
                        icon="memory_alt"
                        label="MAC Address"
                        value={primaryNetwork.mac_address}
                        onCopy={() => copyToClipboard(primaryNetwork.mac_address, 'mac')}
                        copied={copiedField === 'mac'}
                    />
                </div>
            )}

            {/* All Network Adapters */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">settings_ethernet</span>
                    Network Adapters ({networks.length})
                </h2>

                {networks.length === 0 ? (
                    <p className="text-slate-500 text-sm">No network adapters detected</p>
                ) : (
                    <div className="space-y-3">
                        {networks.map((network, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${network.status === 'Up' ? 'bg-green-500/20' : 'bg-slate-700'
                                            }`}>
                                            <span className={`material-symbols-outlined text-xl ${network.status === 'Up' ? 'text-green-400' : 'text-slate-500'
                                                }`}>
                                                {network.adapter_name.toLowerCase().includes('wi-fi') || network.adapter_name.toLowerCase().includes('wireless')
                                                    ? 'wifi'
                                                    : 'lan'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{network.adapter_name}</p>
                                            <p className="text-sm text-slate-400 font-mono">{network.ip_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">MAC</p>
                                            <p className="text-sm text-slate-300 font-mono">{network.mac_address}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${network.status === 'Up'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-slate-600 text-slate-400'
                                            }`}>
                                            {network.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Info */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-cyan-400">info</span>
                    <div>
                        <p className="text-sm text-slate-300">
                            Computer: <span className="text-white font-medium">{systemInfo?.computer_name}</span>
                            {systemInfo?.domain && systemInfo.domain !== 'WORKGROUP' && (
                                <> • Domain: <span className="text-white font-medium">{systemInfo.domain}</span></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NetworkCard({ icon, label, value, onCopy, copied }: {
    icon: string;
    label: string;
    value: string;
    onCopy: () => void;
    copied: boolean;
}) {
    return (
        <div
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors"
            onClick={onCopy}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-lg">{icon}</span>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
            <p className="text-sm font-mono text-white truncate" title={value}>{value}</p>
            <p className="text-xs text-slate-600 mt-1">
                {copied ? '✓ Copied!' : 'Click to copy'}
            </p>
        </div>
    );
}
