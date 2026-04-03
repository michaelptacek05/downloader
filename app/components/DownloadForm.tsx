"use client";

import { useState } from "react";

export default function DownloadForm() {
    const [url, setUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleDownload = (): void => {
        if (!url) {
            alert("Zadejte URL!");
            return;
        }

        setLoading(true);
        window.location.href = `/api/download?url=${encodeURIComponent(url)}`;

        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-4 mb-6 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />

            <button
                onClick={handleDownload}
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-200 flex justify-center items-center ${
                    loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg"
                }`}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Zpracovávám...
                    </span>
                ) : (
                    "Stáhnout MP3"
                )}
            </button>
        </div>
    );
}
