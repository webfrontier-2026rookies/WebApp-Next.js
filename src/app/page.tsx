"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRef } from 'react';

export default function Home() {
  // 1. 選択された画像を保存する「状態（State）」を作る
  const [preview, setPreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // APIに送る用のファイル保持

  // 2. ファイルがドロップされた時の処理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      setSelectedFile(file);

      // Canvas（画板）に元画像を描く
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        }
      };
      img.src = fileUrl;
    }
  }, []);

  // 3. Dropzoneの設定
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, 
    multiple: false,
    noClick: true,
  });

  // APIを使用して画像をマスクする処理
  const handleMask = async () => {
    // 1. まず「ファイルがあるか」「画板(Canvas)があるか」を確認する
    if (!selectedFile || !canvasRef.current) {
      console.log("ファイルが選択されていません");
    return;
    }

    // 2. 荷造りをする (FormData)
    const formData = new FormData();
    formData.append("file", selectedFile); // selectedFileがあることが確定しているので ! は不要

    try {
    // 3. サーバーへ送る
    const response = await fetch(`${process.env.NEXT_PUBLIC_FACE_DETECTION_HOST}/api/v1/detection/detect`, {
      method: "POST",
      headers: { "x-api-key": process.env.NEXT_PUBLIC_FACE_DETECTION_KEY || "" },
      body: formData,
    });

    // 4. サーバーからの答え（座標）をもらう
    const result = await response.json();

    // 5. 顔が見つかったらマスクを重ねる
    if (result.faces && result.faces.length > 0) {
      const ctx = canvasRef.current.getContext("2d");
      const maskImg = new Image();
      maskImg.src = "/mask.png"; // public/mask.png

      maskImg.onload = () => {
        result.faces.forEach((face: any) => {
          // ctx?.drawImage(画像, x, y, 幅, 高さ)
          ctx?.drawImage(maskImg, face.x, face.y, face.width, face.height);
        });
      };
    }
  } catch (error) {
    // 6. 失敗したときの処理
    console.error("エラー:", error);
  } // ここで catch を閉じる
}; // ここで handleMask を閉じる

  const handleRemove = () => {
    // 1. 状態を null に戻す（これで表示が切り替わる）
    setPreview(null);
    
    // 2. (重要) ブラウザのメモリを解放する
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    };

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
          {/* ファイル選択のinput要素を配置 */}
          <input {...getInputProps()} />
          {preview ? (
            //画像があれば表示
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center">
              <p className="font-medium">ここに画像をドラッグ・アンド・ドロップしてください。</p>
            </div>
          )}
        </div>

        <div className="flex gap-20 mt-4 justify-center items-center">
        <button onClick={handleRemove} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">画像を削除</button>
        <button  onClick={preview ? handleMask : open} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
          {preview ? "画像をマスクする" : "画像を選択"}
        </button>
        </div>
      </div>
    </div>
  );
}