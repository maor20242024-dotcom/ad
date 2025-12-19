"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  const [sec, setSec] = useState(7);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    const go = setTimeout(() => {
      window.location.href = "https://www.imperiumgate.com/ar";
    }, 7000);

    return () => {
      clearInterval(t);
      clearTimeout(go);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at top, rgba(241,208,126,0.1), transparent 55%),
                     radial-gradient(circle at bottom, rgba(27,44,88,0.7), #040406)`,
      }}
      dir="rtl"
    >
      <style jsx global>{`
        :root {
          --gold: #d4af37;
          --soft-gold: #f1d07e;
          --deep-navy: #040406;
        }
        body {
          font-family: 'Tajawal', sans-serif;
          margin: 0;
          color: #f8f7f2;
        }
        .glass-card {
          background: rgba(10,10,12,0.7);
          border: 1px solid rgba(212,175,55,0.25);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          backdrop-filter: blur(12px);
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-xl w-full glass-card rounded-[32px] p-8 sm:p-12 text-center relative z-10 border border-[rgba(212,175,55,0.3)]">
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)]">
            <CheckCircle className="w-12 h-12 text-[var(--gold)]" />
          </div>
        </div>

        <h1 className="font-amiri text-3xl sm:text-4xl text-white mb-6">
          شكرًا لك! <br />
          <span className="text-[var(--gold)]">تم استلام طلبك بنجاح</span>
        </h1>

        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          لقد تم تأمين بياناتك بنجاح. سيقوم أحد مستشارينا في <span className="text-white font-bold">Imperium Gate</span> بالتواصل معك خلال الـ 24 ساعة القادمة لمناقشة فرصتك الاستثمارية.
        </p>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl py-4 border border-white/10">
            <p className="text-sm text-gray-400">
              سيتم تحويلك إلى الموقع الرسمي خلال <span className="text-[var(--gold)] font-bold">{sec}</span> ثوانٍ...
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = "https://www.imperiumgate.com/ar")}
            className="w-full bg-[var(--gold)] text-black hover:bg-[#caa449] py-6 text-lg font-bold rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3"
          >
            الذهاب إلى الموقع الآن
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 opacity-50">
          <Image
            src="/media/ads/logo.png"
            alt="Imperium Gate Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <p className="text-[10px] sm:text-xs text-gray-400">
            Imperium Gate Real Estate L.L.C — Registered in Dubai, United Arab Emirates
          </p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--gold)] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--soft-gold)] opacity-[0.03] blur-[120px] rounded-full"></div>
    </div>
  );
}