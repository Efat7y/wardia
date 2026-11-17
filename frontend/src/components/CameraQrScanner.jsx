'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export function CameraQrScanner({ onScanSuccess, isScanningActive = true }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'wardia-gate-qr-reader';

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Play subtle beep or feedback if possible
          if (onScanSuccess) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Ignore normal scan frame misses
        }
      );
      setIsCameraActive(true);
      setScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError(
        'تعذر فتح كاميرا الجهاز (قد تحتاج إذن الكاميرا من المتصفح، أو استخدم خيار الكود النصي البديل أدناه).'
      );
      setIsCameraActive(false);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
        setScanning(false);
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 overflow-hidden border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">الماسح الضوئي الذكي (كاميرا البوابة)</h4>
            <p className="text-[10px] text-slate-400">امسح كود الـ QR الخاص بالعامل بالكاميرا فوراً</p>
          </div>
        </div>

        {isCameraActive ? (
          <button
            type="button"
            onClick={stopScanner}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-[11px] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>إيقاف الكاميرا</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startScanner}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>تشغيل الكاميرا الآن</span>
          </button>
        )}
      </div>

      {/* Camera Video Viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[220px] flex items-center justify-center">
        <div id={containerId} className="w-full h-full max-w-[320px] mx-auto overflow-hidden" />

        {!isCameraActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-950/90">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-300">الكاميرا متوقفة حالياً</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              اضغط على "تشغيل الكاميرا الآن" لمسح كود العامل مباشرة، أو استخدم خيار الإدخال اليدوي إذا كانت الكاميرا معطلة.
            </p>
            <button
              type="button"
              onClick={startScanner}
              className="mt-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-sm"
            >
              فتح عدسة الكاميرا
            </button>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-950/95">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-amber-300">{cameraError}</p>
            <button
              type="button"
              onClick={startScanner}
              className="text-[11px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
