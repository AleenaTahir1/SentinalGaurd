import { useState, useEffect } from "react";
import { DeviceTable } from "../components/devices/DeviceTable";
import { api, UsbDevice } from "../lib/tauri";

export function DeviceManager() {
    const [devices, setDevices] = useState<UsbDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    const fetchDevices = async () => {
        try {
            const data = await api.getConnectedDevices();
            setDevices(data);
        } catch (error) {
            console.error("Failed to fetch devices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleToggle = async (instanceId: string, trusted: boolean) => {
        const device = devices.find((d) => d.instance_id === instanceId);
        if (!device) return;

        try {
            if (trusted) {
                // Add to whitelist
                await api.addToWhitelist(device);
            } else {
                // Remove from whitelist
                await api.removeFromWhitelist(instanceId);
            }

            // Update local state
            setDevices((prev) =>
                prev.map((d) =>
                    d.instance_id === instanceId ? { ...d, is_trusted: trusted } : d
                )
            );
        } catch (error) {
            console.error("Failed to update device trust:", error);
        }
    };

    const handleDelete = async (instanceId: string) => {
        try {
            await api.removeFromWhitelist(instanceId);
            // Refresh device list
            await fetchDevices();
        } catch (error) {
            console.error("Failed to remove device:", error);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        try {
            await fetchDevices();
            // Log the scan event
            await api.addEventLog("INFO", "Manual device scan initiated", undefined);
        } finally {
            setScanning(false);
        }
    };

    // Convert UsbDevice to Device format expected by DeviceTable
    const tableDevices = devices.map((d) => ({
        id: d.instance_id,
        name: d.friendly_name,
        type: d.device_class,
        serialId: d.instance_id.split("\\").pop() || d.instance_id,
        vendor: d.device_class,
        trusted: d.is_trusted,
        threat: !d.is_trusted && d.status !== "OK",
    }));

    return (
        <div className="flex flex-col h-full">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>

            {/* Page Header */}
            <div className="flex items-center justify-between px-8 py-8 z-10 relative">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Connected Devices</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {loading ? "Loading devices..." : `${devices.length} USB devices detected`}
                    </p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50"
                >
                    <span className={`material-symbols-outlined text-[20px] ${scanning ? "animate-spin" : ""}`}>
                        {scanning ? "progress_activity" : "radar"}
                    </span>
                    {scanning ? "Scanning..." : "Scan for Devices"}
                </button>
            </div>

            {/* Table Container */}
            <div className="flex-1 px-8 pb-8 min-h-0 z-10 relative">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <span className="material-symbols-outlined text-[48px] animate-spin">progress_activity</span>
                            <p className="mt-2">Loading devices...</p>
                        </div>
                    </div>
                ) : (
                    <DeviceTable devices={tableDevices} onToggle={handleToggle} onDelete={handleDelete} />
                )}
            </div>
        </div>
    );
}
