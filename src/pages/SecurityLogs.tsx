import { useState, useEffect, useMemo } from "react";
import { LogToolbar } from "../components/security-logs/LogToolbar";
import { LogConsole } from "../components/security-logs/LogConsole";
import { StatusFooter } from "../components/security-logs/StatusFooter";
import { api, EventLog, LogStats } from "../lib/tauri";

export function SecurityLogs() {
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [logsData, statsData] = await Promise.all([
                api.getEventLogs(),
                api.getLogStats(),
            ]);
            setLogs(logsData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 3 seconds
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((entry) => {
            // Filter by level
            if (activeFilter !== "all" && entry.level !== activeFilter) {
                return false;
            }
            // Filter by search query
            if (searchQuery) {
                try {
                    const regex = new RegExp(searchQuery, "i");
                    return regex.test(entry.message) || regex.test(entry.timestamp);
                } catch {
                    return entry.message.toLowerCase().includes(searchQuery.toLowerCase());
                }
            }
            return true;
        });
    }, [logs, searchQuery, activeFilter]);

    const handleExport = async () => {
        try {
            const filePath = await api.exportLogs();
            if (filePath) {
                alert(`Logs exported to: ${filePath}`);
            }
        } catch (error) {
            console.error("Failed to export logs:", error);
        }
    };

    // Convert EventLog to LogEntryData format
    const logEntries = filteredLogs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level as "INFO" | "WARN" | "ERROR" | "BLOCK",
        message: log.message,
    }));

    return (
        <div className="flex flex-col h-full bg-terminal-bg">
            {/* Title Bar */}
            <header className="h-10 flex items-center justify-between px-4 bg-background-dark border-b border-[#223149] app-drag-region">
                <div className="flex items-center text-[#90a7cb] text-xs font-mono">
                    <span className="material-symbols-outlined text-[16px] mr-2">folder_open</span>
                    /var/log/sentinel/security.log
                </div>
            </header>

            {/* Toolbar */}
            <LogToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onExport={handleExport}
            />

            {/* Log Console */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center bg-terminal-bg">
                    <div className="text-center text-slate-500">
                        <span className="material-symbols-outlined text-[48px] animate-spin">progress_activity</span>
                        <p className="mt-2">Loading logs...</p>
                    </div>
                </div>
            ) : (
                <LogConsole entries={logEntries} />
            )}

            {/* Status Footer */}
            <StatusFooter
                totalEvents={stats?.total ?? 0}
                logSize={`${((stats?.total ?? 0) * 0.1).toFixed(1)} KB`}
                lastScan="Just now"
            />
        </div>
    );
}
