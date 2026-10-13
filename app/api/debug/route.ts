import { NextRequest, NextResponse } from "next/server";

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "Cần url" }, { status: 400 });
  }

  const response = await fetch(
    `https://chrome.browserless.io/content?token=${BROWSERLESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 40000,
        },
        waitForTimeout: 4000,
      }),
    }
  );

  const html = await response.text();

  // Trích 5 khu vực có thể chứa tên
  const snippets: any = {};

  // Tìm class fontBodySmall
  const m1 = html.match(/fontBodySmall[\s\S]{0,300}/i);
  snippets.fontBodySmall = m1 ? m1[0].slice(0, 400) : "NOT FOUND";

  // Tìm class d4r55
  const m2 = html.match(/d4r55[\s\S]{0,300}/i);
  snippets.d4r55 = m2 ? m2[0].slice(0, 400) : "NOT FOUND";

  // Tìm class WNxzHc
  const m3 = html.match(/WNxzHc[\s\S]{0,300}/i);
  snippets.WNxzHc = m3 ? m3[0].slice(0, 400) : "NOT FOUND";

  // Tìm author_name
  const m4 = html.match(/author_name[\s\S]{0,200}/i);
  snippets.author_name = m4 ? m4[0].slice(0, 300) : "NOT FOUND";

  // Tìm "Tonya" (chữ có trong tên)
  const m5 = html.match(/Tonya[\s\S]{0,200}/i);
  snippets.tonya = m5 ? m5[0].slice(0, 300) : "NOT FOUND";

  // Tìm bất kỳ button có text name ngắn
  const m6 = html.match(/<button[^>]*jactionPane[^>]*>[\s\S]{0,300}/i);
  snippets.jactionPane = m6 ? m6[0].slice(0, 500) : "NOT FOUND";

  return NextResponse.json({
    htmlLength: html.length,
    snippets,
  });
}