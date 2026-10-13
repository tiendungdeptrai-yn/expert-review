import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";

async function fetchOnce(url: string, fastMode: boolean) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fastMode ? 20000 : 40000);

  try {
    const response = await fetch(
      `https://chrome.browserless.io/content?token=${BROWSERLESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          gotoOptions: {
            waitUntil: fastMode ? "domcontentloaded" : "networkidle2",
            timeout: fastMode ? 15000 : 30000,
          },
          waitForTimeout: fastMode ? 1200 : 3000,
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    );

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

function analyze(html: string): "LIVE" | "DIE" | "UNKNOWN" {
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
    if (p.test(html)) return "DIE";
  }

  const livePatterns = [
    /\d+\s*(tháng|tuần|ngày|năm|giờ)\s*trước/i,
    /\d+\s*(months?|weeks?|days?|years?|hours?)\s*ago/i,
    /[1-5]\s*sao/i,
    /[1-5]\s*stars?/i,
    /aria-label="[^"]*[Ss]ao[^"]*"/,
  ];

  if (livePatterns.filter((p) => p.test(html)).length >= 1) {
    return "LIVE";
  }

  return "UNKNOWN";
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
    if (!BROWSERLESS_TOKEN)
      return { url, status: "ERROR", error: "Chưa cấu hình token" };

    // Lần 1: chạy nhanh
    let result = await fetchOnce(trimmed, true);

    if (!result.ok) {
      // Fallback: chạy chậm nếu lần đầu lỗi
      result = await fetchOnce(trimmed, false);
    }

    if (!result.ok || !result.html) {
      return { url, status: "ERROR", error: result.error || "Không lấy được dữ liệu" };
    }

    const status = analyze(result.html);

    // Nếu UNKNOWN, thử lại 1 lần với chế độ chậm
    if (status === "UNKNOWN") {
      const retry = await fetchOnce(trimmed, false);
      if (retry.ok && retry.html) {
        const status2 = analyze(retry.html);
        if (status2 !== "UNKNOWN") {
          return { url, status: status2 };
        }
      }
    }

    return {
      url,
      status,
      error: status === "UNKNOWN" ? `Không nhận diện được` : undefined,
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

    // Chạy SONG SONG 5 link cùng lúc
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