"use client";

import { useState } from "react";

export default function DebugPage() {
  const [url, setUrl] = useState("https://maps.app.goo.gl/5Ec9anRG9JDtT5kg6");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setData({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔍 Debug HTML Browserless</h1>

        <div className="bg-slate-900 rounded-xl p-4 mb-4">
          <label className="block mb-2 text-sm text-slate-400">Link review:</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
          />
          <button
            onClick={run}
            disabled={loading}
            className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Đang chạy..." : "🔍 CHẠY DEBUG"}
          </button>
        </div>

        {data && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">HTML Length:</div>
              <div className="text-2xl font-bold text-green-400">
                {data.htmlLength ?? "N/A"}
              </div>
            </div>

            {data.snippets &&
              Object.entries(data.snippets).map(([key, val]: any) => (
                <div key={key} className="bg-slate-900 rounded-xl p-4">
                  <div className="text-sm font-bold text-yellow-400 mb-2">
                    {key}
                  </div>
                  <pre className="text-xs bg-black rounded p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all">
                    {val}
                  </pre>
                </div>
              ))}

            {data.error && (
              <div className="bg-red-900/50 rounded-xl p-4 text-red-200">
                {data.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}