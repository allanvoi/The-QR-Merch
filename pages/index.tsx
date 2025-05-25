import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { auth } from "../lib/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [qrLimit, setQrLimit] = useState(5);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const downloadQR = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current);
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-quote.png";
    a.click();
  };

  const handleGenerate = () => {
    if (text.length === 0) {
      setError("Text is required.");
      return;
    }
    if (text.length > 100) {
      setError("Text must be 100 characters or fewer.");
      return;
    }
    if (!currentUser && qrLimit <= 0) {
      alert("You've reached the free limit. Please sign in.");
      router.push("/login");
      return;
    }
    setError("");
    if (!currentUser) setQrLimit((prev) => prev - 1);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          The QR Merch
        </h1>

        {currentUser && (
          <p className="text-sm text-right text-gray-600 mb-2">
            Logged in as: {currentUser.email}{" "}
            <button
              className="text-blue-600 hover:underline ml-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </p>
        )}

        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-2"
          placeholder="Enter quote or phrase (max 100 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100}
          rows={3}
        ></textarea>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 mb-4"
          onClick={handleGenerate}
        >
          Generate QR Code
        </button>

        <div
          ref={qrRef}
          className="bg-white p-4 border border-gray-300 rounded-lg flex justify-center"
        >
          {text && text.length <= 100 && <QRCodeCanvas value={text} size={200} />}
        </div>

        {text && (
          <button
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            onClick={downloadQR}
          >
            Download QR as Image
          </button>
        )}

        {!currentUser && (
          <p className="text-center text-sm text-gray-500 mt-4">
            You have {qrLimit} free generations left.{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in for unlimited access
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
