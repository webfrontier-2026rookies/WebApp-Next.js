import { logger } from "@/app/utils/logger";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const API_URL = process.env.FACE_API_URL as string;
    const API_KEY = process.env.FACE_API_KEY as string;

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