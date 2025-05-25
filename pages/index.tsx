// pages/index.tsx

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getCredits, incrementCredits, MAX_GUEST_CREDITS, resetCredits } from "@/utils/creditLimiter";
import toast, { Toaster } from "react-hot-toast";

// Defer loading of QRCodeStyling to client only
let QRCodeStyling: any;

export default function Home() {
  const [text, setText] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [user, setUser] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  // Load QR code library and initialize instance
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadQRCode = async () => {
      const mod = await import("qr-code-styling");
      QRCodeStyling = mod.default;

      qrCodeInstance.current = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "canvas",
        data: "",
        image: "/logo.png",
        dotsOptions: {
          color: qrColor,
          type: "rounded",
        },
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
      });
    };

    loadQRCode();
  }, []);

  // Watch for user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) resetCredits();
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = () => {
    if (!text.trim()) return toast.error("Please enter a quote.");

    if (!user) {
      const credits = getCredits();
      if (credits >= MAX_GUEST_CREDITS) {
        toast.error("Limit reached. Please log in.");
        return;
      }
      incrementCredits();
    }

    if (!qrCodeInstance.current) return;

    qrCodeInstance.current.update({
      data: text,
      dotsOptions: { color: qrColor },
      backgroundOptions: { color: bgColor },
    });

    // Clear and re-append
    if (qrRef.current) {
      qrRef.current.innerHTML = ""; // Clear previous QR
      qrCodeInstance.current.append(qrRef.current);
    }

    toast.success("QR Code generated!");
  };

  const handleDownload = () => {
    if (!qrCodeInstance.current) return;
    qrCodeInstance.current.download({
      name: "qr-quote",
      extension: "png",
    });
  };

  const handleLogout = () => {
    signOut(auth);
    resetCredits();
    toast("Logged out");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50 text-gray-800">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4">QR Quote Generator</h1>

      <textarea
        maxLength={100}
        placeholder="Enter your quote (max 100 characters)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full max-w-md p-3 border rounded mb-4"
      />

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold">QR Color</label>
          <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold">Background Color</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate QR
        </button>
        <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Download QR
        </button>
      </div>

      <div ref={qrRef} className="mb-6" />

      {user ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Logged in as: {user.email}</p>
          <button onClick={handleLogout} className="mt-2 text-red-600 underline">
            Logout
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-600">
          Guest Mode: {MAX_GUEST_CREDITS - getCredits()} / {MAX_GUEST_CREDITS} free generations left
        </p>
      )}
    </div>
  );
}
