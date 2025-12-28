

interface StatCardProps {
    icon: string;
    iconColor: "primary" | "danger" | "warning" | "success";
    label: string;
    value: string | number;
    badge?: string;
    badgeColor?: "default" | "success";
}

const iconColorMap = {
    primary: "bg-primary/20 text-primary",
    danger: "bg-danger/20 text-danger",
    warning: "bg-warning/20 text-warning",
    success: "bg-success/20 text-success",
};

const hoverBorderMap = {
    primary: "hover:border-primary/50",
    danger: "hover:border-danger/50",
    warning: "hover:border-warning/50",
    success: "hover:border-success/50",
};

const valueHoverColorMap = {
    primary: "group-hover:text-primary",
    danger: "group-hover:text-danger",
    warning: "group-hover:text-warning",
    success: "group-hover:text-success",
};

export function StatCard({ icon, iconColor, label, value, badge, badgeColor = "default" }: StatCardProps) {
    return (
        <div
            className={`bg-surface-dark border border-border-dark p-5 rounded-2xl flex flex-col gap-4 transition-colors group ${hoverBorderMap[iconColor]}`}
        >
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${iconColorMap[iconColor]}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                {badge && (
                    <span
                        className={`text-xs font-mono px-2 py-1 rounded ${badgeColor === "success"
                            ? "text-success bg-success/10"
                            : "text-slate-500 bg-[#0b1121]"
                            }`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
                <p
                    className={`text-3xl font-bold text-white font-mono transition-colors ${valueHoverColorMap[iconColor]}`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

interface StatsGridProps {
    totalScans?: number;
    blockedThreats?: number;
    activePolicy?: string;
}

export function StatsGrid({
    totalScans = 1024,
    blockedThreats = 12,
    activePolicy = "Whitelist Mode",
}: StatsGridProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                icon="radar"
                iconColor="primary"
                label="Total Scans"
                value={totalScans.toLocaleString()}
                badge="24H"
            />
            <StatCard
                icon="block"
                iconColor="danger"
                label="Blocked Threats"
                value={blockedThreats}
                badge="ALL TIME"
            />
            <StatCard
                icon="playlist_add_check"
                iconColor="warning"
                label="Active Policy"
                value={activePolicy}
                badge="ACTIVE"
                badgeColor="success"
            />
        </section>
    );
}
