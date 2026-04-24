"use client";

import { logger } from "./app/utils/logger";

//サーバーの情報を保存(curlコマンドを分解)
export async function callFaceAPI(file: File) {

    const formData = new FormData();
    formData.append("file", file);//curlの -F 部分

    const response = await fetch("/api/face", {
        method: "POST",
        headers: {
        },
        body: formData
    });

    if (!response.ok) {
    const errorData = await response.json();
    alert(errorData.error);
    throw new Error(errorData.error);
}
}