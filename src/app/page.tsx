"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { callFaceAPI } from "../api"; 
import { useRef } from "react";
import { logger } from "./utils/logger";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [faceData, setFaceData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ismasked,setIsMasked] = useState(false);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 1. 画像URLの作成と状態保存
    const fileUrl = URL.createObjectURL(file);
    setImageUrl(fileUrl);
    setSelectedFile(file);
    setFaceData(null); // 前のデータをクリア

    // 2. キャンバスへの描画処理
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

    // 3. 【ここがポイント】API呼び出しを img.onload の「外」に出す
    // これで、画像の読み込みに関係なく、ドロップしたら即APIを叩きに行きます
    try {
      logger.info("API呼び出し開始...");
      const result = await callFaceAPI(file);
      
      console.log("★APIから返ってきた生データ:", result); // これがコンソールに出るかチェック！
      
      if (result) {
        setFaceData(result);
        logger.info("API結果の保存に成功しました");
      } else {
        logger.error("APIの戻り値が空(null/undefined)です");
      }
    } catch (error: any) {
      logger.error("API呼び出しに失敗:", error.message);
    }
  }, []);

  const handleMask = async () => {
    if (!selectedFile || !faceData) {
      logger.error("画像を選択するか、APIの結果を待ってください");
      return;
    }

    const faces = faceData.result;

    if (!Array.isArray(faces) || faces.length === 0) {
      logger.error("顔が見つかりませんでした");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const maskedImage = new Image();

    maskedImage.src = "/mask.png"; 

    maskedImage.onload = () => {
      faces.forEach((face: any) => {
        const { x_min, y_min, x_max, y_max } = face.box;
        const prob = face.box.probability;

        logger.info("AIの自信度:", prob);

        if (prob < 0.8) {
          logger.warn("人間の画像ではありません:", prob);
          return; 
      }

        //幅と高さを計算
        const w = x_max - x_min;
        const h = y_max - y_min;

        if (ctx) {
          ctx.drawImage(maskedImage, x_min, y_min, w, h);
        }
      });
      logger.info("マスクを描画しました！");
      setIsMasked(true);
    };
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, 
    multiple: false,
    noClick: true,
  });
  
  const handleRemove = () => {
    setImageUrl(null);
    setSelectedFile(null);
    setIsMasked(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center items-center mb-4 font-bold">
          顔をマスクする
        </div>

        <div
          {...getRootProps()}
          className={`
            w-full h-64 border-2 rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-black bg-white"}
          `}
        >
          <input {...getInputProps()} />
          {imageUrl ? (
            <canvas ref={canvasRef} className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center">
              <p className="font-medium">ここに画像をドラッグ・アンド・ドロップしてください。</p>
            </div>
          )}
        </div>

        <div className="flex gap-20 mt-4 justify-center items-center">
          {ismasked ? ( 
            //マスク完了後
            <button onClick={handleRemove} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-15 py-2" type="button">
              戻る
            </button>
          ) : (
            <>
              <button onClick={handleRemove} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
                画像を削除
              </button>
              <button onClick={imageUrl ? handleMask : open} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
                {imageUrl ? "画像をマスクする" : "画像を選択"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}