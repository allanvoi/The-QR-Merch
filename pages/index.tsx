import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth } from "../lib/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";

export default function HomePage() {
  const [text, setText] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const qrRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = () => {
    if (!user && generatedCount >= 5) {
      alert("Please log in to generate more QR codes.");
      router.push("/login");
      return;
    }

    if (text.length > 100) {
      alert("QR content must be 100 characters or less.");
      return;
    }

    setGeneratedCount((prev) => prev + 1);
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-quote.png";
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">The QR Merch</h1>
        {user ? (
          <div>
            <span className="mr-2">Hi, {user.email}</span>
            <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => router.push("/login")} className="px-4 py-2 bg-blue-500 text-white rounded">Login / Signup</button>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={100}
            placeholder="Type your quote or phrase here... (max 100 chars)"
            className="w-full p-3 border rounded shadow-sm"
          />
          <div className="mt-2 text-sm text-gray-500">{text.length}/100 characters</div>
          <button
            onClick={handleGenerate}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Generate QR Code
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div ref={qrRef} className="p-4 bg-white shadow rounded">
            {text && <QRCodeCanvas value={text} size={256} />}
          </div>
          {text && (
            <button
              onClick={downloadQRCode}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
            >
              Download QR
            </button>
          )}
        </div>
      </main>

      <footer className="mt-12 text-center text-sm text-gray-400">
        Free users can generate up to 5 QR codes. Sign in to unlock unlimited access.
      </footer>
    </div>
  );
}
