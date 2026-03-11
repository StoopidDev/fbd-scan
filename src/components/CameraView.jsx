import { useEffect, useRef, useState } from "react";

// 🧠 REACT FACT #7: Props — how components talk to each other
// Props are like arguments you pass to a function.
// Parent says: <CameraView onCapture={someFunction} />
// Child receives: function CameraView({ onCapture }) { ... }
// The child can then CALL onCapture() to send data back up to the parent!
// Data flows DOWN (parent → child via props)
// Events flow UP (child → parent via callback functions)

export default function CameraView({ onCapture, onCancel }) {

  // useRef is like useState BUT it doesn't cause re-renders when it changes.
  // Perfect for storing a reference to a real DOM element (like the <video> tag).
  // Think of it as a "sticky note" attached directly to the HTML element.
  const videoRef = useRef(null);
  const streamRef = useRef(null); // store the camera stream so we can stop it later

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // 🧠 REACT FACT #8: useEffect — "do this after the screen updates"
  // useEffect runs AFTER the component appears on screen.
  // The [] at the end means "only run this ONCE when component first appears"
  // (If you put [someVariable] it runs every time that variable changes)
  // The RETURN function is a "cleanup" — runs when the component disappears.
  // This is where we start AND stop the camera!

  useEffect(() => {
    startCamera();

    // Cleanup: when CameraView disappears from screen, stop the camera
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // <- the empty [] means "run once on mount"

  const startCamera = async () => {
    try {
      // This is the browser API that asks for camera permission
      // { video: { facingMode: "environment" } } means "use the BACK camera"
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;

      // videoRef.current is the actual <video> HTML element
      // We attach the camera stream to it so it shows live footage
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      // Most common errors: user denied permission, or no camera found
      if (err.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  const handleCapture = () => {
    // To capture a photo from video, we draw one frame onto a canvas
    // then export that canvas as a base64 image string
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // getContext("2d") gives us drawing tools for the canvas
    canvas.getContext("2d").drawImage(video, 0, 0);

    // toDataURL gives us "data:image/jpeg;base64,/9j/4AAQ..."
    // We strip the prefix to get just the base64 data for the API
    const fullDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64Only = fullDataUrl.split(",")[1];

    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Send captured image UP to App.jsx via the onCapture prop callback
    onCapture(base64Only);
  };

  return (
    <div className="camera-view">
      {cameraError ? (
        <div className="camera-error">
          <span className="error-icon">📵</span>
          <p>{cameraError}</p>
          <button onClick={onCancel} className="btn-secondary">Go Back</button>
        </div>
      ) : (
        <>
          <div className="video-container">
            {/* 🧠 The ref={videoRef} is how we "grab" this element in JavaScript.
                After render, videoRef.current BECOMES this <video> element. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline  // required on iOS to prevent fullscreen
              muted
              className="camera-feed"
            />
            <div className="camera-overlay">
              <div className="scan-frame">
                <div className="corner tl"></div>
                <div className="corner tr"></div>
                <div className="corner bl"></div>
                <div className="corner br"></div>
                <p className="frame-hint">Center object in frame</p>
              </div>
            </div>
          </div>

          <div className="camera-controls">
            <button onClick={onCancel} className="btn-cancel">✕ Cancel</button>
            <button 
              onClick={handleCapture} 
              className="btn-capture"
              disabled={!cameraReady}
            >
              <span className="capture-ring"></span>
              <span className="capture-dot"></span>
            </button>
            <div className="spacer"></div>
          </div>
          
          {!cameraReady && (
            <p className="camera-loading">Starting camera...</p>
          )}
        </>
      )}
    </div>
  );
}
