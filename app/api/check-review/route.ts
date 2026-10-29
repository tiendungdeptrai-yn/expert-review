import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// API Key ScrapingBee
const SCRAPINGBEE_API_KEY = "VI736ZTORUVONIPSEHGCFTL2PQJQY3VN8YY8MI5SQB4AO2EBYPLWD0V4YPVZKFN2X0ELSFSWR57AQU1J";

async function fetchOnce(url: string, fastMode: boolean) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fastMode ? 25000 : 35000);

  try {
    const encodedUrl = encodeURIComponent(url);
    // Đợi các class đặc trưng của review Google Maps xuất hiện
    const waitSelector = encodeURIComponent('.fontBodySmall, .jactionPane, .d4r55');
    // wait=3000: chờ thêm 3 giây sau khi selector xuất hiện để trang load đủ
    const apiUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPINGBEE_API_KEY}&url=${encodedUrl}&render_js=true&wait_for=${waitSelector}&wait=3000`;

    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    return { ok: true, html };
  } catch (e: any) {
    clearTimeout(timeout);
    return { ok: false, error: e.name === "AbortError" ? "Timeout" : e.message };
  }
}

function analyze(html: string): { status: "LIVE" | "DIE" | "UNKNOWN" } {
  // 1. Ưu tiên check DIE trước
  const diePatterns = [
    /không còn khả dụng/i,
    /không còn tồn tại/i,
    /không khả dụng/i,
    /no longer available/i,
    /no longer exists/i,
    /review is no longer/i,
    /this review is not available/i,
    /无法查看/,
    /无法使用/,
    /已被删除/,
  ];
  for (const p of diePatterns) {
    if (p.test(html)) return { status: "DIE" };
  }

  // 2. Check LIVE bằng các pattern ngày tháng / sao
  const livePatterns = [
    /\d+\s*(tháng|tuần|ngày|năm|giờ)\s*trước/i,
    /\d+\s*(months?|weeks?|days?|years?|hours?)\s*ago/i,
    /[1-5]\s*sao/i,
    /[1-5]\s*stars?/i,
  ];
  if (livePatterns.some((p) => p.test(html))) {
    return { status: "LIVE" };
  }

  // 3. Fallback: nếu tìm thấy class đặc trưng của Google Maps và HTML đủ lớn -> LIVE
  const hasMapsElements = /fontBodySmall|jactionPane|d4r55|WNxzHc/i.test(html);
  if (hasMapsElements && html.length > 150000) {
    return { status: "LIVE" };
  }

  return { status: "UNKNOWN" };
}

async function checkOne(url: string) {
  try {
    const trimmed = url.trim();
    if (!trimmed) return { url, status: "ERROR", error: "Link trống" };

    const valid =
      trimmed.includes("google.com/maps") ||
      trimmed.includes("goo.gl/maps") ||
      trimmed.includes("maps.app.goo.gl") ||
      trimmed.includes("google.com/maps/reviews");

    if (!valid) return { url, status: "ERROR", error: "Link không hợp lệ" };

    // Lần 1: chạy nhanh
    let result = await fetchOnce(trimmed, true);

    // Nếu lỗi thì thử lại chế độ chậm
    if (!result.ok) {
      result = await fetchOnce(trimmed, false);
    }

    if (!result.ok || !result.html) {
      return { url, status: "ERROR", error: result.error || "Không lấy được dữ liệu" };
    }

    let analysis = analyze(result.html);

    // Nếu UNKNOWN, thử lại 1 lần nữa với chế độ chậm để chắc chắn
    if (analysis.status === "UNKNOWN") {
      const retry = await fetchOnce(trimmed, false);
      if (retry.ok && retry.html) {
        analysis = analyze(retry.html);
      }
    }

    return {
      url,
      status: analysis.status,
    };
  } catch (e: any) {
    return { url, status: "ERROR", error: e.message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Cần mảng urls" }, { status: 400 });
    }
    // Tối đa 3 link/request (an toàn cho Vercel 60s)
    if (urls.length > 3) {
      return NextResponse.json({ error: "Tối đa 3 link/request" }, { status: 400 });
    }

    // Chạy song song 2 link cùng lúc để tăng tốc
    const concurrency = 2;
    const results = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((u: string) => checkOne(u)));
      results.push(...batchResults);
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: "Lỗi server: " + e.message }, { status: 500 });
  }
}