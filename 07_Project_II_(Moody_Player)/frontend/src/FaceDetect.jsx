import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const FaceSwap = () => {
  const sourceImgRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const sourceFaceRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => clearInterval(intervalRef.current);
  }, []);

  // ✅ LOAD MODELS
  const loadModels = async () => {
    const MODEL_URL = "/models";

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
  };

  // ✅ STEP 1: LOAD IMAGE INTO <img> TAG
  const handleSourceImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    sourceImgRef.current.src = url;

    sourceImgRef.current.onload = async () => {
      await extractFaceFromImage();
    };
  };

  // ✅ STEP 2: DETECT & CUT FACE FROM IMAGE
  const extractFaceFromImage = async () => {
    const img = sourceImgRef.current;

    const detection = await faceapi
      .detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
      )
      .withFaceLandmarks();

    if (!detection) {
      alert("❌ No face found in image");
      return;
    }

    const box = detection.detection.box;

    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = box.width;
    faceCanvas.height = box.height;

    const faceCtx = faceCanvas.getContext("2d");
    faceCtx.drawImage(
      img,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height
    );

    sourceFaceRef.current = faceCanvas;

    alert("✅ Face successfully captured from image");
  };

  // ✅ STEP 3: LOAD VIDEO
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    videoRef.current.src = url;
    videoRef.current.play();

    videoRef.current.onplay = () => startFaceSwap();
  };

  // ✅ STEP 4: FACE MASK ON VIDEO
  const startFaceSwap = () => {
    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!sourceFaceRef.current) return;

      if (video.readyState === 4 && !video.paused && !video.ended) {
        const w = video.clientWidth;
        const h = video.clientHeight;

        canvas.width = w;
        canvas.height = h;

        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
          )
          .withFaceLandmarks();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!detection) return;

        const resized = faceapi.resizeResults(detection, {
          width: w,
          height: h,
        });

        const box = resized.detection.box;

        // ✅ OVERLAY IMAGE FACE ON VIDEO FACE
        ctx.drawImage(
          sourceFaceRef.current,
          box.x,
          box.y,
          box.width,
          box.height
        );
      }
    }, 80);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Image → Face Mask → Video</h2>

      <div>
        <b>Upload Image:</b>
        <input type="file" accept="image/*" onChange={handleSourceImage} />
      </div>

      <div>
        <b>Upload Video:</b>
        <input type="file" accept="video/*" onChange={handleVideo} />
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 20, justifyContent: "center" }}>
        <img ref={sourceImgRef} style={{ height: 180 }} alt="source" />

        <div style={{ position: "relative" }}>
          <video ref={videoRef} controls style={{ maxWidth: "720px" }} />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FaceSwap;
