"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    // MediaDevicesのサポートをチェック
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      setErrMessage("お使いのブラウザではカメラ機能がサポートされていません。");
    }
  }, []);

  // ImageNet 1k recognitions
  const handleImageNet1kClick = async () => {
    router.push("/ImageNet1k");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 prose">
      <h1>画像認識プログラム</h1>

      {errMessage ? (
        <div role="alert" className="alert alert-error">
          <span>{errMessage}</span>
        </div>
      ) : (
        <button
          className="btn btn-primary btn-wide btn-lg text-xl"
          onClick={handleImageNet1kClick}
        >
          1000分類
        </button>
      )}
    </main>
  );
}
