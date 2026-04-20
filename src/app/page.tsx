"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  // 1. 選択された画像を保存する「状態（State）」を作る
  const [preview, setPreview] = useState<string | null>(null);

  // 2. ファイルがドロップされた時の処理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  }, []);

  // 3. Dropzoneの設定
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, 
    multiple: false,
  });

  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center items-center">
          顔をマスクする
        </div>

        {/* getRootPropsを広げることで、この枠全体が反応するようになります */}
        <div
          {...getRootProps()}
          className={`
            w-full h-64 border-2 rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-black bg-white"}
          `}
        >
          {preview ? (
            /* 画像があれば表示 */
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
          ) : (
            /* なければテキストを表示 */
            <div className="text-center">
              <p className="font-medium">ここに画像をドラッグ・アンド・ドロップしてください。</p>
            </div>
          )}
        </div>

        <div className="flex gap-20 mt-4 justify-center items-center">
        <button className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">画像を削除</button>
        <button className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">画像を送信</button>
      </div>
      </div>
    </div>
  );
}