import { EventLog } from "../../lib/tauri";

interface ActivityItemProps {
    type: "allowed" | "blocked";
    title: string;
    description: string;
    time: string;
    tags?: { label: string; variant: "success" | "danger" | "default" }[];
    isLast?: boolean;
}

function ActivityItem({ type, title, description, time, tags = [], isLast = false }: ActivityItemProps) {
    const iconMap = {
        allowed: { icon: "check_circle", color: "text-success", hoverBorder: "group-hover:border-success" },
        blocked: { icon: "block", color: "text-danger", hoverBorder: "group-hover:border-danger" },
    };

    const { icon, color, hoverBorder } = iconMap[type];

    return (
        <div className={`flex gap-4 items-start relative z-10 group ${!isLast ? "pb-6" : ""}`}>
            <div
                className={`flex-shrink-0 size-10 rounded-full bg-[#0b1121] border border-border-dark flex items-center justify-center transition-colors ${hoverBorder}`}
            >
                <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
            </div>
            <div className="flex-1 pt-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white text-sm font-medium">{title}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{description}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-[#0b1121] px-2 py-1 rounded border border-white/5">
                        {time}
                    </span>
                </div>
                {tags.length > 0 && (
                    <div className="mt-2 flex gap-2">
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tag.variant === "success"
                                        ? "bg-success/10 text-success border-success/20"
                                        : tag.variant === "danger"
                                            ? "bg-danger/10 text-danger border-danger/20"
                                            : "bg-slate-800 text-slate-400 border-slate-700"
                                    }`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ActivityFeedProps {
    events?: EventLog[];
    onViewFullLog?: () => void;
}

export function ActivityFeed({ events = [], onViewFullLog }: ActivityFeedProps) {
    // Convert EventLog to ActivityItem format
    const items = events.map((event) => {
        const isBlocked = event.level === "BLOCK" || event.level === "ERROR";
        return {
            type: isBlocked ? "blocked" as const : "allowed" as const,
            title: event.level === "BLOCK" ? "Threat Blocked" :
                event.level === "ERROR" ? "Error" :
                    event.level === "WARN" ? "Warning" : "Event",
            description: event.message,
            time: event.timestamp,
            tags: [
                {
                    label: event.level,
                    variant: isBlocked ? "danger" as const : "success" as const
                },
            ],
        };
    });

    return (
        <section className="flex flex-col gap-4 bg-surface-dark border border-border-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <button
                    onClick={onViewFullLog}
                    className="text-xs font-mono text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                >
                    View Full Log
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-[48px] mb-2">inbox</span>
                    <p className="text-sm">No recent activity</p>
                </div>
            ) : (
                <div className="flex flex-col relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border-dark z-0"></div>

                    {items.map((item, index) => (
                        <ActivityItem
                            key={index}
                            type={item.type}
                            title={item.title}
                            description={item.description}
                            time={item.time}
                            tags={item.tags}
                            isLast={index === items.length - 1}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
