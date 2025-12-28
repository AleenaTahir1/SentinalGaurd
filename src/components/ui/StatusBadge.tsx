interface StatusBadgeProps {
    variant: "trusted" | "blocked" | "warning";
    children: React.ReactNode;
}

const variantStyles = {
    trusted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blocked: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const dotStyles = {
    trusted: "bg-emerald-400",
    blocked: "bg-rose-400",
    warning: "bg-amber-400",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
        >
            <span className={`size-1.5 rounded-full ${dotStyles[variant]}`}></span>
            {children}
        </span>
    );
}
