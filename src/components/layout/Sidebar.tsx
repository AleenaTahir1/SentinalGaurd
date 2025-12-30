import { NavLink } from "react-router-dom";

interface NavItem {
    icon: string;
    label: string;
    to: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: "Overview",
        items: [
            { icon: "dashboard", label: "Dashboard", to: "/" },
        ]
    },
    {
        title: "Security",
        items: [
            { icon: "usb", label: "Devices", to: "/devices" },
            { icon: "shield", label: "Firewall", to: "/firewall" },
            { icon: "monitor_heart", label: "Process Monitor", to: "/processes" },
            { icon: "terminal", label: "Security Logs", to: "/logs" },
        ]
    },
    {
        title: "System",
        items: [
            { icon: "computer", label: "System Info", to: "/system" },
            { icon: "language", label: "Network", to: "/network" },
            { icon: "bolt", label: "Startup Programs", to: "/startup" },
        ]
    },
    {
        title: "Utilities",
        items: [
            { icon: "wifi", label: "WiFi Passwords", to: "/wifi" },
            { icon: "delete_sweep", label: "Disk Cleanup", to: "/cleanup" },
        ]
    },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-[#0f1623] border-r border-border-dark flex flex-col shrink-0 h-full overflow-y-auto z-10">
            <div className="p-4 flex flex-col gap-1">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-3">
                        <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {section.title}
                        </p>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                        ? "bg-primary/10 border border-primary/20 text-white"
                                        : "hover:bg-white/5 text-slate-400 hover:text-white border border-transparent"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={`material-symbols-outlined text-lg ${isActive ? "text-primary filled" : "group-hover:text-primary"
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
                ))}
            </div>
        </aside>
    );
}

