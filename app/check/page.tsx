"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "LIVE" | "DIE" | "UNKNOWN" | "ERROR";

type ResultItem = {
  url: string;
  status: Status;
  error?: string;
};

type Summary = {
  total: number;
  live: number;
  die: number;
  unknown: number;
  error: number;
};

const BATCH_SIZE = 3;

export default function CheckPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [progress, setProgress] = useState({
    done: 0,
    total: 0,
    batch: 0,
    totalBatches: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheck = async () => {
    const urls = input
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setErrorMsg("Vui lòng dán ít nhất 1 link review");
      return;
    }

    if (urls.length > 50) {
      setErrorMsg("Tối đa 50 link 1 lần. Bạn đã dán " + urls.length + " link.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setResults([]);
    setSummary(null);
    setProgress({
      done: 0,
      total: urls.length,
      batch: 0,
      totalBatches: Math.ceil(urls.length / BATCH_SIZE),
    });

    const allResults: ResultItem[] = [];
    const totalBatches = Math.ceil(urls.length / BATCH_SIZE);

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

      setProgress({
        done: allResults.length,
        total: urls.length,
        batch: batchIndex,
        totalBatches,
      });

      try {
        const res = await fetch("/api/check-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: batch }),
        });

        const data = await res.json();

        if (res.ok && data.results) {
          allResults.push(...data.results);
        } else {
          batch.forEach((u) =>
            allResults.push({
              url: u,
              status: "ERROR",
              error: data.error || `Lỗi batch ${batchIndex}`,
            })
          );
        }
      } catch {
        batch.forEach((u) =>
          allResults.push({
            url: u,
            status: "ERROR",
            error: "Lỗi kết nối tới server",
          })
        );
      }

      setResults([...allResults]);
    }

    const s: Summary = {
      total: allResults.length,
      live: allResults.filter((r) => r.status === "LIVE").length,
      die: allResults.filter((r) => r.status === "DIE").length,
      unknown: allResults.filter((r) => r.status === "UNKNOWN").length,
      error: allResults.filter((r) => r.status === "ERROR").length,
    };
    setSummary(s);
    setLoading(false);
  };

  const clearAll = () => {
    setInput("");
    setResults([]);
    setSummary(null);
    setErrorMsg("");
    setProgress({ done: 0, total: 0, batch: 0, totalBatches: 0 });
  };

  const statusBadge = (status: Status) => {
    const map = {
      LIVE: { bg: "bg-green-500", text: "LIVE", icon: "✓" },
      DIE: { bg: "bg-red-500", text: "DIE", icon: "✕" },
      UNKNOWN: { bg: "bg-yellow-500", text: "?", icon: "?" },
      ERROR: { bg: "bg-slate-400", text: "LỖI", icon: "!" },
    };
    const s = map[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${s.bg} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}
      >
        <span>{s.icon}</span>
        {s.text}
      </span>
    );
  };

  const shortUrl = (url: string, max = 60) =>
    url.length <= max ? url : url.slice(0, max) + "...";

  const urlCount = input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  const progressPercent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const estTime =
    urlCount > 0 ? Math.ceil((urlCount / 5) * 8) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white py-12 md:py-20">
      <div className="container-x max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 font-medium"
        >
          ← Về trang chủ
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 mb-4">
            ⚡ Công cụ kiểm tra siêu nhanh
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Check Review{" "}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Live / Die
            </span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Dán <strong>nhiều link</strong> review Google Maps (mỗi link 1 dòng) →
            check song song, tối đa <strong>50 link/lần</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-lg">
          <label className="block font-semibold text-slate-800 mb-2">
            Dán danh sách link review (mỗi link 1 dòng):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`https://maps.app.goo.gl/5Ec9anRG9JDtT5kg6\nhttps://maps.app.goo.gl/vJ68dRKYXQyRVobr8\nhttps://maps.app.goo.gl/...`}
            rows={10}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 text-slate-800 font-mono text-sm"
            disabled={loading}
          />

          {errorMsg && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheck}
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? `⏳ Đang check...` : `🔍 KIỂM TRA`}
            </button>

            {(results.length > 0 || input) && !loading && (
              <button
                onClick={clearAll}
                className="text-slate-600 hover:text-red-600 font-medium underline"
              >
                Xóa và check lại
              </button>
            )}

            <span className="text-sm text-slate-500 ml-auto">
              {urlCount} link
              {urlCount > 0 && (
                <span className="text-slate-400">
                  {" "}
                  · ~{estTime}s
                </span>
              )}
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            💡 Mẹo: Trong Google Maps → mở review → Share → Copy link. Dán mỗi
            link 1 dòng. Tối đa 50 link/lần.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="inline-block w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-slate-800">
                  Đang kiểm tra {progress.done}/{progress.total} link...
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Batch {progress.batch}/{progress.totalBatches} · Mỗi batch 10
                  link (chạy song song)
                </div>
                <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {summary && !loading && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
              <div className="text-3xl font-extrabold text-slate-800">
                {summary.total}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                Tổng link
              </div>
            </div>
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-green-600">
                {summary.live}
              </div>
              <div className="text-xs text-green-700 uppercase tracking-wider mt-1">
                ✓ Live
              </div>
            </div>
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-red-600">
                {summary.die}
              </div>
              <div className="text-xs text-red-700 uppercase tracking-wider mt-1">
                ✕ Die
              </div>
            </div>
            <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-yellow-600">
                {summary.unknown + summary.error}
              </div>
              <div className="text-xs text-yellow-700 uppercase tracking-wider mt-1">
                ? Khác
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">
                📋 Kết quả chi tiết ({results.length}
                {loading ? ` / ${progress.total}` : ""} link)
              </h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50"
                >
                  <div className="text-sm text-slate-400 w-8 text-right shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm text-slate-700 truncate font-mono"
                      title={r.url}
                    >
                      {shortUrl(r.url)}
                    </div>
                    {r.error && (
                      <div className="text-xs text-red-500 mt-0.5">
                        {r.error}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">{statusBadge(r.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary && summary.die > 0 && !loading && (
          <div className="mt-8 rounded-2xl border-2 border-red-500 bg-red-50 p-6 md:p-8">
            <h3 className="text-xl font-extrabold text-red-700 mb-2">
              🎯 Bạn có {summary.die} review cần xóa?
            </h3>
            <p className="text-slate-700 mb-4">
              Liên hệ ngay để được tư vấn miễn phí và báo giá trong 5 phút.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:0564987979" className="btn-primary">
                📞 Gọi 0564.987.979
              </a>
              <a
                href="https://zalo.me/0564987979"
                target="_blank"
                rel="noopener"
                className="btn-outline"
              >
                💬 Chat Zalo
              </a>
            </div>
          </div>
        )}

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3">
            📖 Công cụ này dùng để làm gì?
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>⚡ Check siêu nhanh nhờ chạy 5 link song song</li>
            <li>✅ Kiểm tra hàng loạt review đã xóa còn "sống" không</li>
            <li>✅ Chứng minh dịch vụ xóa review hoạt động hiệu quả</li>
            <li>✅ Miễn phí 100%, tối đa 50 link/lần check</li>
          </ul>
        </div>
      </div>
    </div>
  );
}