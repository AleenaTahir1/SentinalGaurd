import { useState } from "react";
import { Toggle } from "../ui/Toggle";
import { StatusBadge } from "../ui/StatusBadge";

export interface Device {
    id: string;
    name: string;
    type: string;
    serialId: string;
    vendor: string;
    trusted: boolean;
    threat?: boolean;
}

interface DeviceRowProps {
    device: Device;
    onToggle: (id: string, trusted: boolean) => void;
    onDelete: (id: string) => void;
}

const iconMap: Record<string, string> = {
    "USB 3.0": "usb",
    "SDXC Card": "sd_card",
    "HID Device": "keyboard",
    "MTP Device": "smartphone",
    "Threat Detected": "warning",
};

export function DeviceRow({ device, onToggle, onDelete }: DeviceRowProps) {
    const isThreat = device.threat || !device.trusted;
    const icon = device.threat ? "warning" : iconMap[device.type] || "usb";

    return (
        <div
            className={`group grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-dark items-center transition-colors ${device.threat
                    ? "bg-rose-500/[0.02] hover:bg-rose-500/[0.05]"
                    : "hover:bg-white/[0.02]"
                }`}
        >
            {/* Device Name */}
            <div className="col-span-3 flex items-center gap-3">
                <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 ${device.threat
                            ? "bg-rose-900/20 text-rose-500"
                            : "bg-slate-700 text-slate-300"
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div>
                    <div className="font-medium text-white text-sm">{device.name}</div>
                    <div className={`text-[11px] ${device.threat ? "text-rose-400" : "text-slate-500"}`}>
                        {device.threat ? "Threat Detected" : device.type}
                    </div>
                </div>
            </div>

            {/* Serial ID */}
            <div className="col-span-3 font-mono text-xs text-slate-400 tracking-wide">
                {device.serialId}
            </div>

            {/* Vendor */}
            <div className="col-span-2 text-sm text-slate-300">{device.vendor}</div>

            {/* Status */}
            <div className="col-span-2">
                <StatusBadge variant={device.trusted ? "trusted" : "blocked"}>
                    {device.trusted ? "Trusted" : "Blocked"}
                </StatusBadge>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-4">
                <button
                    onClick={() => onDelete(device.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-1"
                >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
                <Toggle
                    id={`toggle-${device.id}`}
                    checked={device.trusted}
                    onChange={(checked) => onToggle(device.id, checked)}
                />
            </div>
        </div>
    );
}

interface DeviceTableProps {
    devices: Device[];
    onToggle: (id: string, trusted: boolean) => void;
    onDelete: (id: string) => void;
}

export function DeviceTable({ devices, onToggle, onDelete }: DeviceTableProps) {
    return (
        <div className="h-full flex flex-col bg-surface-dark border border-border-dark rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-black/20 border-b border-border-dark text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Device Name</div>
                <div className="col-span-3">Serial ID</div>
                <div className="col-span-2">Vendor</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1">
                {devices.map((device) => (
                    <DeviceRow
                        key={device.id}
                        device={device}
                        onToggle={onToggle}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-dark bg-black/20 flex items-center justify-between text-xs text-slate-400">
                <span>Showing {devices.length} devices</span>
                <div className="flex gap-2">
                    <button className="hover:text-white disabled:opacity-50" disabled>
                        Previous
                    </button>
                    <span className="text-slate-600">|</span>
                    <button className="hover:text-white">Next</button>
                </div>
            </div>
        </div>
    );
}
