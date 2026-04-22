"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRef } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      setSelectedFile(file); // ★ ファイルを保持
    }
  }, []); 

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, 
    multiple: false,
    noClick: true,
  });
  
  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
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
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center">
              <p className="font-medium">ここに画像をドラッグ・アンド・ドロップしてください。</p>
            </div>
          )}
        </div>

        <div className="flex gap-20 mt-4 justify-center items-center">
          <button onClick={handleRemove} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
            画像を削除
          </button>
          <button onClick={preview ? undefined : open} className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">
            {preview ? "画像をマスクする" : "画像を選択"}
          </button>
        </div>
      </div>
    </div>
  );
}