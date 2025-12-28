import { LogEntry, LogEntryData } from "./LogEntry";

interface LogConsoleProps {
    entries: LogEntryData[];
}

export function LogConsole({ entries }: LogConsoleProps) {
    return (
        <div className="flex-1 overflow-auto p-6 bg-terminal-bg" id="log-container">
            <div className="flex flex-col gap-1 font-mono text-sm leading-relaxed max-w-7xl mx-auto">
                {/* Column Headers */}
                <div className="flex items-center pb-2 mb-2 border-b border-white/5 text-[#5e7ba3] text-xs uppercase tracking-wider font-semibold">
                    <div className="w-32 shrink-0">Timestamp</div>
                    <div className="w-24 shrink-0">Level</div>
                    <div className="flex-1">Message</div>
                </div>

                {/* Log Entries */}
                {entries.map((entry) => (
                    <LogEntry key={entry.id} entry={entry} />
                ))}

                {/* End of Stream Indicator */}
                <div className="mt-8 flex items-center gap-4">
                    <div className="h-px bg-[#223149] flex-1"></div>
                    <span className="text-[#314668] text-xs uppercase tracking-widest font-mono">
                        End of stream
                    </span>
                    <div className="h-px bg-[#223149] flex-1"></div>
                </div>
            </div>
        </div>
    );
}
