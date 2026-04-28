"use client";

import { logger } from "./app/utils/logger";

export async function callFaceAPI(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/face", {
        method: "POST",
        headers: {},
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        logger.error(errorData.error);
        throw new Error(errorData.error);
    }

    // 1. レスポンスを JSON として解析する
    const data = await response.json();

    return data; 
}