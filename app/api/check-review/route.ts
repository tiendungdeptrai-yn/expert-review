import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Đã đổi sang ScrapingAnt
const SCRAPINGANT_API_KEY = process.env.SCRAPINGANT_API_KEY || "3510211a1f424b248b64a4d668f5af81";

async function fetchOnce(url: string, fastMode: boolean) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fastMode ? 25000 : 45000);

  try {
    // Cấu hình các tham số cho ScrapingAnt
    const encodedUrl = encodeURIComponent(url);
    const selector = encodeURIComponent('[class*="fontBodySmall"], [class*="d4r55"], [class*="jactionPane"], [class*="WNxzHc"]');
    const timeoutSec = fastMode ? 20 : 35;

    // ScrapingAnt sử dụng phương thức GET cho API v2/general
    const apiUrl = `https://api.scrapingant.com/v2/general?url=${encodedUrl}&x-api-key=${SCRAPINGANT_API_KEY}&browser=true&timeout=${timeoutSec}&wait_for_selector=${selector}`;

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

function extractDays(html: string): number | null {
  const vnPatterns: Array<{ re: RegExp; multiplier: number }> = [
    { re: /(\d+)\s*giờ\s*trước/i, multiplier: 1 / 24 },
    { re: /(\d+)\s*ngày\s*trước/i, multiplier: 1 },
    { re: /(\d+)\s*tuần\s*trước/i, multiplier: 7 },
    { re: /(\d+)\s*tháng\s*trước/i, multiplier: 30 },
    { re: /(\d+)\s*năm\s*trước/i, multiplier: 365 },
  ];

  const enPatterns: Array<{ re: RegExp; multiplier: number }> = [
    { re: /(\d+)\s*hours?\s*ago/i, multiplier: 1 / 24 },
    { re: /(\d+)\s*days?\s*ago/i, multiplier: 1 },
    { re: /(\d+)\s*weeks?\s*ago/i, multiplier: 7 },
    { re: /(\d+)\s*months?\s*ago/i, multiplier: 30 },
    { re: /(\d+)\s*years?\s*ago/i, multiplier: 365 },
  ];

  const allPatterns = [...vnPatterns, ...enPatterns];

  for (const { re, multiplier } of allPatterns) {
    const m = html.match(re);
    if (m) {
      const num = parseInt(m[1], 10);
      const days = Math.round(num * multiplier);
      return days;
    }
  }

  return null;
}

function extractName(html: string): string | null {
  const p1 = html.match(
    /<button[^>]*\bjactionPane\b[^>]*>([^<]{2,60})<\/button>/i
  );
  if (p1) {
    const n = p1[1].trim();
    if (n && !/^\d+$/.test(n) && n.length >= 2) return n;
  }

  const p2 = html.match(
    /<button[^>]*class="[^"]*\bfontTitleSmall\b[^"]*"[^>]*>([^<]{2,60})<\/button>/i
  );
  if (p2) {
    const n = p2[1].trim();
    if (n && !/^\d+$/.test(n)) return n;
  }

  const p3 = html.match(
    /<div[^>]*class="[^"]*\bfontBodySmall\b[^"]*"[^>]*>([^<]{2,60})<\/div>/i
  );
  if (p3) {
    const n = p3[1].trim();
    if (n) return n;
  }

  const p4 = html.match(/"author_name"\s*:\s*"([^"\\]{2,60})"/);
  if (p4) return p4[1].trim();

  const p5 = html.match(/aria-label="(?:Ảnh về|Photo of)\s+([^"]{2,60})"/i);
  if (p5) return p5[1].trim();

  return null;
}

function analyze(html: string): {
  status: "LIVE" | "DIE" | "UNKNOWN";
  name: string | null;
  days: number | null;
} {
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
    /n'est plus disponible/i,
    /ya no está disponible/i,
    /nicht mehr verfügbar/i,
    /não está mais disponível/i,
    /もはや利用できません/,
  ];

  for (const p of diePatterns) {
    if (p.test(html)) return { status: "DIE", name: null, days: null };
  }

  const livePatterns = [
    /\d+\s*(tháng|tuần|ngày|năm|giờ)\s*trước/i,
    /\d+\s*(months?|weeks?|days?|years?|hours?)\s*ago/i,
    /[1-5]\s*sao/i,
    /[1-5]\s*stars?/i,
    /aria-label="[^"]*[Ss]ao[^"]*"/,
  ];

  if (livePatterns.filter((p) => p.test(html)).length >= 1) {
    return {
      status: "LIVE",
      name: extractName(html),
      days: extractDays(html),
    };
  }

  return { status: "UNKNOWN", name: null, days: null };
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
    
    // Kiểm tra token ScrapingAnt
    if (!SCRAPINGANT_API_KEY)
      return { url, status: "ERROR", error: "Chưa cấu hình token ScrapingAnt" };

    // Lần 1: chạy nhanh
    let result = await fetchOnce(trimmed, true);

    if (!result.ok) {
      // Fallback: chạy chậm nếu lần đầu lỗi
      result = await fetchOnce(trimmed, false);
    }

    if (!result.ok || !result.html) {
      return { url, status: "ERROR", error: result.error || "Không lấy được dữ liệu" };
    }

    const analysis = analyze(result.html);

    // Nếu UNKNOWN, thử lại 1 lần với chế độ chậm
    if (analysis.status === "UNKNOWN") {
      const retry = await fetchOnce(trimmed, false);
      if (retry.ok && retry.html) {
        const analysis2 = analyze(retry.html);
        if (analysis2.status !== "UNKNOWN") {
          return {
            url,
            status: analysis2.status,
            name: analysis2.name,
            days: analysis2.days,
          };
        }
      }
    }

    return {
      url,
      status: analysis.status,
      name: analysis.name,
      days: analysis.days,
      error: analysis.status === "UNKNOWN" ? `Không nhận diện được` : undefined,
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

    if (urls.length > 10) {
      return NextResponse.json({ error: "Tối đa 10 link/batch" }, { status: 400 });
    }

    const concurrency = 1;
    const results = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((u: string) => checkOne(u)));
      results.push(...batchResults);
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}