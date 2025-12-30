import { NavLink } from "react-router-dom";

interface NavItem {
    icon: string;
    label: string;
    to: string;
}

const mainNav: NavItem[] = [
    { icon: "dashboard", label: "Dashboard", to: "/" },
    { icon: "usb", label: "Devices", to: "/devices" },
    { icon: "terminal", label: "Logs", to: "/logs" },
    { icon: "wifi", label: "WiFi Password", to: "/wifi" },
    { icon: "computer", label: "System Info", to: "/system" },
    { icon: "bolt", label: "Startup Programs", to: "/startup" },
    { icon: "language", label: "Network", to: "/network" },
    { icon: "delete_sweep", label: "Disk Cleanup", to: "/cleanup" },
    { icon: "shield", label: "Firewall", to: "/firewall" },
    { icon: "monitor_heart", label: "Process Monitor", to: "/processes" },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-[#0f1623] border-r border-border-dark flex flex-col shrink-0 h-full overflow-y-auto z-10">
            <div className="p-4 flex flex-col gap-2">
                <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Navigation
                </p>
                {mainNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                ? "bg-primary/10 border border-primary/20 text-white"
                                : "hover:bg-white/5 text-slate-400 hover:text-white border border-transparent"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`material-symbols-outlined ${isActive ? "text-primary filled" : "group-hover:text-primary"
                                        } transition-colors`}
                                >
                                    {item.icon}
                                </span>
                                <p className="text-sm font-medium">{item.label}</p>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
}
