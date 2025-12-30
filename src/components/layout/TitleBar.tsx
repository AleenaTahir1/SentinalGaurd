import { useState, useEffect } from "react";

// Check if running in Tauri environment
const isTauri = () => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

export function TitleBar() {
    const [appWindow, setAppWindow] = useState<any>(null);

    useEffect(() => {
        const initWindow = async () => {
            if (isTauri()) {
                try {
                    const { getCurrentWindow } = await import("@tauri-apps/api/window");
                    const win = getCurrentWindow();
                    setAppWindow(win);
                } catch (e) {
                    console.error("Failed to get window:", e);
                }
            }
        };
        initWindow();
    }, []);

    const handleMinimize = async () => {
        if (appWindow) {
            try {
                await appWindow.minimize();
            } catch (e) {
                console.error("Failed to minimize:", e);
            }
        }
    };

    const handleClose = async () => {
        if (appWindow) {
            try {
                await appWindow.close();
            } catch (e) {
                console.error("Failed to close:", e);
            }
        }
    };

    return (
        <header className="app-drag-region flex items-center justify-between border-b border-border-dark bg-[#111927] px-6 py-3 shrink-0 h-16 z-20 relative">
            <div className="flex items-center gap-3 text-white">
                <img src="/logo.svg" alt="SentinelGuard" className="size-8" />
                <h2 className="text-white text-lg font-bold leading-tight tracking-tight">SentinelGuard</h2>
            </div>

            <div className="flex items-center gap-6 no-drag">
                {/* Status Badge */}
                <div className="hidden md:flex items-center gap-2 bg-surface-dark px-3 py-1.5 rounded-full border border-border-dark">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span className="text-xs font-mono text-slate-300">ENGINE ACTIVE</span>
                </div>

                {/* Window Controls */}
                <div className="flex gap-3">
                    <button
                        onClick={handleMinimize}
                        className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex items-center justify-center size-8 rounded-full bg-danger/10 hover:bg-danger text-danger hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
