import Image from "next/image";

export default function Home() {
  return (
    <>
    <div className="mt-20">
      <div className="flex justify-center items-center">
        <h2>顔をマスクする</h2>
      </div>

      <div className="bg-primary text-white px-4 py-2 rounded flex justify-center items-center">
        <p className="text-gray-800 font-medium border border-black rounded-2xl px-16 py-35">
          ここに画像をドラッグ・アンド・ドロップしてください。
        </p>
      </div>
    

      <div className="flex gap-20 mt-4 justify-center items-center">
        <button className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">画像を削除</button>
        <button className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2" type="button">画像を送信</button>
      </div>
    </div>
    </>
  );
}
