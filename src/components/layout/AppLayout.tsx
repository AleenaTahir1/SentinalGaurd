import { Outlet } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
    return (
        <div className="h-screen flex flex-col bg-background-dark text-white font-display overflow-hidden">
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col relative overflow-y-auto bg-gradient-to-b from-background-dark to-[#0f1525]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
