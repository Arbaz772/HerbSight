import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X, FlipHorizontal, Zap, AlertCircle } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [guidance, setGuidance] = useState("Position plant in center");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera found. Please connect a camera and try again.");
      } else {
        setError("Unable to access camera. Please check your browser settings and try again.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isReady) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `plant-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onCapture(file);
            stopCamera();
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo. Please try again.");
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setIsReady(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Guidance Overlay */}
        {isReady && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 border-4 border-white/40 rounded-3xl backdrop-blur-sm" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-3xl" />
              </div>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
              {guidance}
            </div>
          </>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4" />
              <p className="text-lg font-medium">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-md p-6 space-y-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 h-14 w-14 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            onClick={capturePhoto}
            disabled={!isReady}
            className="h-20 w-20 rounded-full bg-white hover:bg-green-100 shadow-2xl relative disabled:opacity-50"
          >
            <div className="absolute inset-2 bg-green-500 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={flipCamera}
            disabled={!isReady}
            className="text-white hover:bg-white/10 h-14 w-14 rounded-full disabled:opacity-50"
          >
            <FlipHorizontal className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-white/60 text-xs">
          <Zap className="w-4 h-4" />
          <span>Good lighting improves accuracy</span>
        </div>
      </div>
    </div>
  );
}