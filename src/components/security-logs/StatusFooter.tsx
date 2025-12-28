interface StatusFooterProps {
    totalEvents: number;
    logSize: string;
    lastScan: string;
}

export function StatusFooter({ totalEvents, logSize, lastScan }: StatusFooterProps) {
    return (
        <footer className="h-9 bg-[#101723] border-t border-[#223149] flex items-center justify-between px-4 text-xs z-10">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#90a7cb]">
                    <div className="size-2 rounded-full bg-success animate-pulse"></div>
                    <span className="font-medium">Service: Active</span>
                </div>
                <div className="flex items-center gap-2 text-[#90a7cb]">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    <span>Last scan: {lastScan}</span>
                </div>
            </div>
            <div className="flex items-center gap-4 text-[#5e7ba3]">
                <span>
                    Total Events: <span className="text-slate-300">{totalEvents.toLocaleString()}</span>
                </span>
                <span>
                    Log Size: <span className="text-slate-300">{logSize}</span>
                </span>
            </div>
        </footer>
    );
}
