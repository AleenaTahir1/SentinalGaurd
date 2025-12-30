import { useState, useEffect } from "react";
import { api, NetworkInfo } from "../lib/tauri";

export function Network() {
    const [networks, setNetworks] = useState<NetworkInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getNetworkInfo();
                setNetworks(data);
            } catch (error) {
                console.error("Failed to fetch network info:", error);
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Network
                </h1>
                <p className="text-slate-400 text-sm">Active network adapters and connection details</p>
            </div>

            {/* Network Adapters */}
            <section className="space-y-4">
                {networks.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <p className="text-slate-400 text-sm">No active network connections found</p>
                    </div>
                ) : (
                    networks.map((network, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{network.adapter_name}</p>
                                    <p className="text-xs text-green-400">{network.status}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <InfoCard label="IP Address" value={network.ip_address} highlight />
                                <InfoCard label="Subnet" value={network.subnet_mask} />
                                <InfoCard label="Gateway" value={network.gateway} />
                                <InfoCard label="DNS Servers" value={network.dns_servers} />
                                <InfoCard label="MAC Address" value={network.mac_address} />
                                <InfoCard label="Status" value={network.status} />
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

function InfoCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-sm font-medium truncate ${highlight ? 'text-cyan-400' : 'text-white'}`} title={value}>
                {value}
            </p>
        </div>
    );
}
