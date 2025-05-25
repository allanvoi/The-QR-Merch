import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { auth } from "../lib/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Home() {
  const [text, setText] = useState("");
  const [qrCount, setQrCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = () => {
    if (text.length > 100) {
      toast.error("Maximum of 100 characters allowed");
      return;
    }
    if (!user && qrCount >= 5) {
      toast.error("Limit reached. Please log in to continue.");
      router.push("/login");
      return;
    }
    setHasGenerated(true);
    if (!user) {
      setQrCount((prev) => prev + 1);
    }
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current);
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "qr-quote.png";
    link.click();
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">QR Quote Generator</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a quote or phrase (max 100 characters)"
        maxLength={100}
        className="w-full max-w-md mx-auto p-4 border rounded shadow-sm focus:outline-none focus:ring"
      ></textarea>

      <div className="my-4">
        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded shadow"
        >
          Generate QR
        </button>
      </div>

      {hasGenerated && (
        <div ref={qrRef} className="flex justify-center mt-4">
          <QRCodeCanvas value={text} size={256} bgColor="#ffffff" fgColor="#000000" />
        </div>
      )}

      {hasGenerated && (
        <div className="mt-4">
          <button
            onClick={downloadQR}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Download QR
          </button>
        </div>
      )}

      {user ? (
        <div className="mt-6">
          <p className="text-sm">Logged in as: <strong>{user.email}</strong></p>
          <button
            onClick={handleLogout}
            className="mt-2 text-red-600 underline"
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-sm mt-6 text-gray-500">Guest user: {5 - qrCount} free generations left</p>
      )}
    </div>
  );
}
