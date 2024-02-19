"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  // MobileNet型またはnullを持つことができる状態を設定
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  // 明示的にMediaDeviceInfo[]型をuseStateに設定
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [timerId, setTimerId] = useState(null);
  const [errMessage, setErrMessage] = useState("");
  const [predictClassName, setPredictClassName] = useState("");

  useEffect(() => {
    // TensorFlow.jsのバックエンドを設定
    tf.setBackend("webgl").then(() => {
      console.log("TensorFlow.js backend set to WebGL");

      // モデルをロード
      async function loadModel() {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      }

      loadModel();

      // 利用可能なカメラを取得
      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        const videoInputDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setCameras(videoInputDevices);
      });
    });
    // videoRef.currentをeffect内でローカル変数にコピー
    const currentVideoRef = videoRef.current;

    return () => {
      // コンポーネントのクリーンアップ
      if (currentVideoRef && currentVideoRef.srcObject) {
        // srcObjectをMediaStreamとして扱うための型アサーション
        const mediaStream: MediaStream =
          currentVideoRef.srcObject as MediaStream;
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop()); // すべてのトラックを停止
      }
      // 進行中のタイマーがあればクリア
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]); // timerIdを依存関係リストに追加

  async function enableCam() {
    if (!model) return;

    const constraints = {
      video: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // videoRef.currentがnullでないことを確認してからイベントリスナーを追加
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    }
  }

  function predictWebcam() {
    // videoRef.currentがnullでないこと、そしてビデオが再生中であること、
    // そしてmodelがnullでないことを確認
    if (
      videoRef.current &&
      videoRef.current.readyState >= 2 &&
      model !== null
    ) {
      model
        .classify(videoRef.current)
        .then(function (predictions) {
          console.log(predictions[0].className);
          setPredictClassName(predictions[0].className);
          // 次のフレームの分類のためにこの関数を3秒後に再度呼び出す
          setTimeout(predictWebcam, 3000);
        })
        .catch((error) => {
          console.error("Model classification error:", error);
          setErrMessage("Model classification error: " + error);
        });
    } else {
      console.log("Video not ready or model is null.");
      setErrMessage("Video not ready or model is null.");
    }
  }

  async function switchCamera(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedCameraId = event.target.value;
    const constraints = {
      video: { deviceId: { exact: selectedCameraId } },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }

  // ImageNet 1k recognitions
  const handleCloseClick = async () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 prose">
      <h1>1000分類</h1>
      {errMessage ? (
        <div role="alert" className="alert alert-error">
          <span>{errMessage}</span>
        </div>
      ) : null}
      <select
        className="select select-primary w-full max-w-xs"
        onChange={switchCamera}
      >
        {cameras.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${index + 1}`}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary btn-wide btn-lg text-xl"
        onClick={enableCam}
        disabled={!model}
      >
        認識開始
      </button>

      <video ref={videoRef} autoPlay playsInline></video>
      <div role="alert" className="alert alert-info">
        <span>{predictClassName}</span>
      </div>
      <button
        className="btn btn-primary btn-wide btn-lg text-xl"
        onClick={handleCloseClick}
      >
        戻る
      </button>
    </main>
  );
}
