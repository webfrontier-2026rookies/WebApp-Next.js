import { logger } from "@/app/utils/logger";
import { NextResponse } from "next/server";

const Url = process.env.FACE_API_URL;
const Key = process.env.FACE_API_KEY;

if (!Url || !Key) {
  const msg = "環境変数が設定されていません。";
  logger.error(msg);
  throw new Error(msg); // これがあるから、下の代入が「安全」になります
}

const API_URL = Url;
const API_KEY = Key;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY || "",
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    logger.error("サーバー内部でエラー発生:", error.message);
    return NextResponse.json(
      { error: `サーバー内部通信エラー: ${error.message}` },
      { status: 500 }
    );
  }
}