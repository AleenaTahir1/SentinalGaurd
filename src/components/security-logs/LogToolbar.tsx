

interface FilterChipProps {
    label: string;
    active?: boolean;
    color?: string;
    onClick: () => void;
}

function FilterChip({ label, active = false, color, onClick }: FilterChipProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${active
                ? "bg-[#223149] border border-[#314668] text-white hover:bg-[#314668]"
                : "bg-[#182334] border border-transparent text-[#90a7cb] hover:bg-[#223149] hover:text-white"
                }`}
        >
            {color && <span className={`size-2 rounded-full ${color}`}></span>}
            {label}
        </button>
    );
}

interface LogToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    onExport: () => void;
    onRefresh: () => void;
    refreshing?: boolean;
}

export function LogToolbar({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
    onExport,
    onRefresh,
    refreshing = false,
}: LogToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 bg-background-dark/50 border-b border-[#223149] backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative group w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#90a7cb] group-focus-within:text-primary transition-colors text-[20px]">
                            search
                        </span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search logs (RegEx supported)..."
                        className="block w-full pl-10 pr-3 py-2 bg-[#182334] border border-[#223149] rounded-full text-sm text-white placeholder-[#90a7cb] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-display"
                    />
                </div>

                <div className="h-6 w-px bg-[#314668] hidden sm:block"></div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto">
                    <FilterChip
                        label="All Events"
                        active={activeFilter === "all"}
                        onClick={() => onFilterChange("all")}
                    />
                    <FilterChip
                        label="Info"
                        color="bg-primary"
                        active={activeFilter === "INFO"}
                        onClick={() => onFilterChange("INFO")}
                    />
                    <FilterChip
                        label="Warnings"
                        color="bg-warning"
                        active={activeFilter === "WARN"}
                        onClick={() => onFilterChange("WARN")}
                    />
                    <FilterChip
                        label="Blocked"
                        color="bg-danger"
                        active={activeFilter === "BLOCK"}
                        onClick={() => onFilterChange("BLOCK")}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#223149] hover:bg-[#314668] text-white text-sm font-bold rounded-full transition-colors"
                >
                    <span className={`material-symbols-outlined text-[18px] ${refreshing ? "animate-spin" : ""}`}>
                        {refreshing ? "progress_activity" : "refresh"}
                    </span>
                    <span>Refresh</span>
                </button>
                <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-900/20"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}
