import { useState, useEffect } from "react";
import { api, TempFileInfo, CleanupResult } from "../lib/tauri";

export function DiskCleanup() {
    const [tempInfo, setTempInfo] = useState<TempFileInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [result, setResult] = useState<CleanupResult | null>(null);

    const fetchData = async () => {
        try {
            const data = await api.getTempInfo();
            setTempInfo(data);
        } catch (error) {
            console.error("Failed to fetch temp info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalSize = tempInfo.reduce((sum, t) => sum + t.size_mb, 0);
    const totalFiles = tempInfo.reduce((sum, t) => sum + t.file_count, 0);

    const handleCleanup = async () => {
        setCleaning(true);
        setShowConfirm(false);
        try {
            const cleanResult = await api.cleanTempFiles();
            setResult(cleanResult);
            await fetchData(); // Refresh data
        } catch (error) {
            console.error("Cleanup failed:", error);
        } finally {
            setCleaning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-3xl">delete_sweep</span>
                        Disk Cleanup
                    </h1>
                    <p className="text-slate-400 text-sm">Remove temporary files to free up disk space</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl p-6 border border-orange-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-400 text-2xl">folder_delete</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalSize.toFixed(1)} MB</p>
                            <p className="text-sm text-slate-400">{totalFiles.toLocaleString()} files can be cleaned</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={cleaning || totalFiles === 0}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        {cleaning ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Cleaning...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Clean Now
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Result Message */}
            {result && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <div>
                            <p className="text-green-400 font-medium">Cleanup Complete</p>
                            <p className="text-sm text-slate-400">
                                Deleted {result.deleted_count} files and freed {result.freed_mb.toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Temp Locations */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Temp Locations</h2>
                <div className="space-y-3">
                    {tempInfo.map((info, index) => (
                        <div key={index} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">folder</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm truncate max-w-[400px]" title={info.path}>
                                        {info.path}
                                    </p>
                                    <p className="text-xs text-slate-500">{info.file_count} files</p>
                                </div>
                            </div>
                            <p className="text-cyan-400 font-mono text-sm">{info.size_mb.toFixed(1)} MB</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-yellow-400">warning</span>
                    <div>
                        <p className="text-yellow-400 font-medium text-sm">Caution</p>
                        <p className="text-xs text-slate-400">
                            Some temporary files may be in use by running applications. Those files will be skipped.
                            Make sure to save all work before cleaning.
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-400 text-xl">delete_forever</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Confirm Cleanup</h3>
                                <p className="text-sm text-slate-400">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to delete <span className="text-cyan-400 font-bold">{totalFiles.toLocaleString()}</span> temporary files
                            ({totalSize.toFixed(1)} MB)?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCleanup}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                            >
                                Delete Files
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
