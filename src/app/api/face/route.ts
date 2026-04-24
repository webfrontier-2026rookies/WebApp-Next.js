import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const API_URL = process.env.FACE_API_URL as string;
    const API_KEY = process.env.FACE_API_KEY as string;

    console.log("サーバー側: 外部APIへリクエストを開始します...");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY || "",
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: `外部APIエラー: ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    // 10秒待たされた後の fetch failed はここに来ます
    console.error("サーバー内部でエラー発生:", error.message);
    return NextResponse.json(
      { error: `サーバー内部通信エラー: ${error.message}` },
      { status: 500 }
    );
  }
}