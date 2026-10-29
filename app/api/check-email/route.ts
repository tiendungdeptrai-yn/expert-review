import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Thiếu danh sách email" }, { status: 400 });
    }

    const apiKey = process.env.REOON_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Lỗi server: Chưa cấu hình REOON_API_KEY" }, { status: 500 });
    }

    const results = [];

    for (const email of emails) {
      try {
        const reoonUrl = `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${apiKey}&mode=power`;
        
        const response = await fetch(reoonUrl, { method: 'GET', cache: 'no-store' });
        const data = await response.json();

        let mappedStatus = "UNKNOWN";
        // SỬA Ở ĐÂY: Nhận cả "valid" và "safe"
        if (data.status === "valid" || data.status === "safe") {
          mappedStatus = "LIVE";
        } 
        else if (["invalid", "disposable", "spamtrap"].includes(data.status)) {
          mappedStatus = "DIE";
        }
        else if (data.status === "error" || data.error) {
          mappedStatus = "ERROR";
        }

        results.push({
          url: email,
          status: mappedStatus,
          error: data.error || null
        });
      } catch (err) {
        results.push({
          url: email,
          status: "ERROR",
          error: "Lỗi kết nối tới Reoon API"
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}