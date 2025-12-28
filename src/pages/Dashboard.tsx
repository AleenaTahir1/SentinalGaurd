import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldStatus } from "../components/dashboard/ShieldStatus";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { api, DashboardStats, EventLog } from "../lib/tauri";

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsData, eventsData] = await Promise.all([
                api.getDashboardStats(),
                api.getEventLogs(),
            ]);
            setStats(statsData);
            setRecentEvents(eventsData.slice(0, 5)); // Get last 5 events
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const isSecure = stats?.is_secure ?? true;
    const blockedCount = stats?.blocked_devices ?? 0;

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-10">
            <ShieldStatus secure={isSecure} unauthorizedCount={blockedCount} />

            <StatsGrid
                totalScans={stats?.total_scans ?? 0}
                blockedThreats={stats?.blocked_threats ?? 0}
                activePolicy="Whitelist Mode"
            />

            <ActivityFeed
                events={recentEvents}
                onViewFullLog={() => navigate("/logs")}
            />

            {/* Footer Info */}
            <div className="flex justify-between items-center text-xs text-slate-600 font-mono mt-4">
                <p>System Status: {loading ? "LOADING..." : "ONLINE"}</p>
                <p>Devices: {stats?.total_devices ?? 0} connected</p>
            </div>
        </div>
    );
}
