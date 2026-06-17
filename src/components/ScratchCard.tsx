"use client";

import { useEffect, useRef, useState } from "react";

interface ScratchCardProps {
  onScratchStart: () => void;
  onScratchComplete: () => void;
  status: "idle" | "requesting" | "success" | "denied" | "error";
  onRetry: () => void;
}

export default function ScratchCard({
  onScratchStart,
  onScratchComplete,
  status,
  onRetry,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchStarted, setScratchStarted] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);

  useEffect(() => {
    initCanvas();
    // Resize listener
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas dimensions to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill silver background
    ctx.fillStyle = "#cbd5e1"; // light slate-300
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scratch texture / noise
    ctx.fillStyle = "#94a3b8"; // slate-400
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add overlay text
    ctx.fillStyle = "#1e293b"; // slate-800
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH SECURITY SEAL TO VERIFY", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#475569"; // slate-600
    ctx.fillText("InCred Finance Verification Portal", canvas.width / 2, canvas.height / 2 + 15);
  };

  const handleResize = () => {
    // Keep canvas drawing state intact on resize if possible, or just re-init
    initCanvas();
    setScratchStarted(false);
    setScratchedPercentage(0);
  };

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startScratching = (e: any) => {
    if (status === "requesting" || status === "denied") return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const stopScratching = () => {
    setIsDrawing(false);
    checkScratchProgress();
  };

  const handleScratchMove = (e: any) => {
    if (!isDrawing || status === "requesting" || status === "denied") return;
    // Prevent scrolling on mobile while scratching
    if (e.cancelable) e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2); // 25px brush size
    ctx.fill();

    if (!scratchStarted) {
      setScratchStarted(true);
      onScratchStart();
    }
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let erased = 0;

    // Sample every 4th pixel to make it faster
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) {
        erased++;
      }
    }

    const totalPixels = data.length / 16;
    const percentage = (erased / totalPixels) * 100;
    setScratchedPercentage(percentage);

    if (percentage > 45) {
      // Auto-clear the canvas once 45% is scratched to reveal full reward
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onScratchComplete();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[220px] rounded-2xl overflow-hidden select-none bg-white">
      {/* Background Reward Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-amber-100 text-center">
        {status === "success" ? (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="text-indigo-900 font-extrabold text-xs tracking-widest uppercase mb-1">
              InCred Verification Reward
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
              ₹500.00
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mb-2">
              Geotag Address Verified successfully
            </p>
            <div className="bg-white border border-dashed border-indigo-400 px-4 py-2 rounded-xl text-sm font-mono text-slate-700 shadow-sm">
              Code: <span className="font-bold text-indigo-600 select-all">INC-500-REWD-2026</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <span className="text-sm font-bold">Secure Security Card</span>
            <span className="text-xs">Verify your location to activate</span>
          </div>
        )}
      </div>

      {/* Canvas Scratch Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={startScratching}
        onMouseUp={stopScratching}
        onMouseLeave={stopScratching}
        onMouseMove={handleScratchMove}
        onTouchStart={startScratching}
        onTouchEnd={stopScratching}
        onTouchMove={handleScratchMove}
        className={`absolute inset-0 cursor-pointer touch-none z-10 transition-opacity duration-300 ${
          status === "success" && scratchedPercentage > 45 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Loading overlay for Geolocation validation */}
      {status === "requesting" && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white px-4 text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Performing geotag address validation...</span>
          <span className="text-xs text-slate-400 mt-1">Please allow location request when prompted.</span>
        </div>
      )}

      {/* Access Denied prompt overlay */}
      {(status === "denied" || status === "error") && (
        <div className="absolute inset-0 bg-slate-950/95 z-20 flex flex-col items-center justify-center text-white p-5 text-center">
          <div className="text-amber-500 font-bold text-sm mb-1.5 flex items-center gap-1.5">
            <span>Location Verification Blocked</span>
          </div>
          <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-4">
            To ensure verification data is accurate and prevent duplication, active geographic verification is required.
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-white"
          >
            Verify Location & Claim
          </button>
        </div>
      )}
    </div>
  );
}
