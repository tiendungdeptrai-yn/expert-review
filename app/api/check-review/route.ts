import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";

async function checkOne(url: string) {
  try {
    const trimmed = url.trim();
    if (!trimmed) return { url, status: "ERROR", error: "Link trống" };

    const isValidLink =
      trimmed.includes("google.com/maps") ||
      trimmed.includes("goo.gl/maps") ||
      trimmed.includes("maps.app.goo.gl") ||
      trimmed.includes("google.com/maps/reviews");

    if (!isValidLink) {
      return { url, status: "ERROR", error: "Link không hợp lệ" };
    }

    if (!BROWSERLESS_TOKEN) {
      return { url, status: "ERROR", error: "Chưa cấu hình BROWSERLESS_TOKEN" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(
      `https://chrome.browserless.io/content?token=${BROWSERLESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          gotoOptions: {
            waitUntil: "networkidle2",
            timeout: 40000,
          },
          waitForTimeout: 2500,
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        url,
        status: "ERROR",
        error: `Browserless ${response.status}: ${errText.slice(0, 150)}`,
      };
    }

    const html = await response.text();

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

    for (const pattern of diePatterns) {
      if (pattern.test(html)) {
        return { url, status: "DIE" };
      }
    }

    const livePatterns = [
      /\d+\s*(tháng|tuần|ngày|năm|giờ)\s*trước/i,
      /\d+\s*(months?|weeks?|days?|years?|hours?)\s*ago/i,
      /[1-5]\s*sao/i,
      /[1-5]\s*stars?/i,
      /aria-label="[^"]*[Ss]ao[^"]*"/,
    ];

    const liveMatches = livePatterns.filter((p) => p.test(html)).length;

    if (liveMatches >= 1) {
      return { url, status: "LIVE" };
    }

    return {
      url,
      status: "UNKNOWN",
      error: `Không nhận diện được (HTML length: ${html.length})`,
    };
  } catch (error: any) {
    const msg =
      error.name === "AbortError"
        ? "Quá thời gian (timeout)"
        : error.message || "Không kết nối được";
    return { url, status: "ERROR", error: msg };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Cần gửi mảng urls" }, { status: 400 });
    }

    if (urls.length > 5) {
  return NextResponse.json(
    { error: "Tối đa 5 link mỗi batch" },
    { status: 400 }
  );
}


    const results = [];
    const concurrency = 3;

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((u: string) => checkOne(u))
      );
      results.push(...batchResults);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Check error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}