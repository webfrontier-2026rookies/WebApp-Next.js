"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { callFaceAPI } from "../api"; 
import { useRef } from "react";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [faceData, setFaceData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ismasked,setIsMasked] = useState(false);


  const onDrop = useCallback(async(acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      setSelectedFile(file); //ファイルを保持

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

      // APIを呼び出す
      const result = await callFaceAPI(file);
      setFaceData(result);//apiの結果を保存
    }
  }, []); 

  const handleMask = async () => {
    if (!selectedFile || !faceData) {
      console.error("画像を選択するか、APIの結果を待ってください");
      return;
    }

    const faces = faceData.result;

    if (!Array.isArray(faces) || faces.length === 0) {
      console.error("顔リストが見つからない、または配列ではありません:", faceData);
      alert("顔が見つかりませんでした");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const maskedImage = new Image();

    maskedImage.src = "/mask.png"; 

    maskedImage.onload = () => {
      faces.forEach((face: any) => {
        const { x_min, y_min, x_max, y_max } = face.box;

        //幅と高さを計算
        const w = x_max - x_min;
        const h = y_max - y_min;

        if (ctx) {
          ctx.drawImage(maskedImage, x_min, y_min, w, h);
        }
      });
      alert("マスクを描画しました！");

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
    setPreview(null);
    setSelectedFile(null);
    setIsMasked(false);
    if (preview) {
      URL.revokeObjectURL(preview);
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
          {preview ? (
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
              <button onClick={preview ? handleMask : open} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
                {preview ? "画像をマスクする" : "画像を選択"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}