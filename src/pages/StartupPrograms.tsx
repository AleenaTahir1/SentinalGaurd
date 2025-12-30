import { useState, useEffect } from "react";
import { api, StartupProgram } from "../lib/tauri";

export function StartupPrograms() {
    const [programs, setPrograms] = useState<StartupProgram[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getStartupPrograms();
                setPrograms(data);
            } catch (error) {
                console.error("Failed to fetch startup programs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Startup Programs
                </h1>
                <p className="text-slate-400 text-sm">Programs that run automatically when Windows starts</p>
            </div>

            {/* Startup Programs List */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                {programs.length === 0 ? (
                    <p className="text-slate-400 text-sm">No startup programs found</p>
                ) : (
                    <div className="space-y-3">
                        {programs.map((program, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium">{program.name}</p>
                                        <p className="text-xs text-slate-400 font-mono truncate mt-1" title={program.command}>
                                            {program.command}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {program.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {program.user}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-xs text-slate-500 mt-4">
                    💡 Review startup programs regularly to ensure no malicious software is running at boot
                </p>
            </section>
        </div>
    );
}
