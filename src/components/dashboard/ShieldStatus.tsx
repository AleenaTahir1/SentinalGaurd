interface ShieldStatusProps {
    secure?: boolean;
    unauthorizedCount?: number;
}

export function ShieldStatus({ secure = true, unauthorizedCount = 0 }: ShieldStatusProps) {
    return (
        <section className="flex flex-col items-center justify-center py-6 gap-6 relative">
            {/* Decorative background glow */}
            <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${secure ? "bg-success/10" : "bg-danger/10"
                    }`}
            ></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Shield */}
                <div className={`shield-pulse mb-6 ${secure ? "text-success" : "text-danger"}`}>
                    <span
                        className="material-symbols-outlined text-[120px]"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 48" }}
                    >
                        {secure ? "verified_user" : "gpp_bad"}
                    </span>
                </div>

                {/* Status Title */}
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight text-center mb-2">
                    {secure ? "System Secure" : "Threat Detected"}
                </h1>

                {/* Status Badge */}
                <div className="flex items-center gap-2 bg-surface-dark border border-border-dark rounded-full px-4 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${secure ? "bg-success" : "bg-danger animate-pulse"}`}></span>
                    <p className="text-slate-300 text-sm font-medium">
                        Monitoring Active •{" "}
                        <span className="text-white font-mono">{unauthorizedCount}</span> Unauthorized Devices
                    </p>
                </div>
            </div>
        </section>
    );
}
