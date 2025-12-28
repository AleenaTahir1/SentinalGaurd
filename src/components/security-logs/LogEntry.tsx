interface LogEntryData {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "BLOCK";
    message: string;
}

interface LogEntryProps {
    entry: LogEntryData;
}

const levelColors = {
    INFO: "text-primary",
    WARN: "text-warning",
    ERROR: "text-danger",
    BLOCK: "text-danger",
};

export function LogEntry({ entry }: LogEntryProps) {
    const isHighlighted = entry.level === "BLOCK";

    return (
        <div
            className={`group flex items-start py-1 px-2 -mx-2 rounded hover:bg-white/5 transition-colors cursor-text selectable ${isHighlighted
                    ? "bg-danger/5 border-l-2 border-danger pl-3 ml-[-12px] my-1"
                    : ""
                }`}
        >
            <div className="w-32 shrink-0 text-[#64748b]">{entry.timestamp}</div>
            <div className={`w-24 shrink-0 font-bold ${levelColors[entry.level]}`}>
                [{entry.level}]
            </div>
            <div className={`flex-1 ${isHighlighted ? "text-white font-medium" : "text-slate-300"}`}>
                {entry.message}
            </div>
        </div>
    );
}

export type { LogEntryData };
