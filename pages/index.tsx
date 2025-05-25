import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth } from "../lib/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";

export default function QRQuoteGenerator() {
  const [text, setText] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(256);
  const [user, setUser] = useState<User | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const generateQR = () => {
    if (text.trim()) {
      setQrVisible(true);
    } else {
      setQrVisible(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.png";
    link.click();
  };

  const clearQR = () => {
    setText("");
    setQrVisible(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f2f5, #e6ebf1)",
        padding: "2rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "auto",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: "bold", marginBottom: "1.5rem" }}>
          The QR Merch
        </h1>

        {user ? (
          <div style={{ marginBottom: "1rem", textAlign: "center", fontSize: "14px", color: "#555" }}>
            Logged in as <strong>{user.email}</strong>{" "}
            <button
              onClick={handleLogout}
              style={{
                marginLeft: "1rem",
                fontSize: "13px",
                background: "#f87171",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "0.3rem 0.6rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <button
              onClick={() => router.push("/login")}
              style={{
                fontSize: "14px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
              }}
            >
              Login / Signup
            </button>
          </div>
        )}

        <input
          placeholder="Enter your quote or message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "16px",
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", justifyContent: "center" }}>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          <input
            type="number"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            min={64}
            max={512}
            step={32}
            style={{ width: "60px", borderRadius: "6px", padding: "0.25rem", fontSize: "14px" }}
            title="QR Size"
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={generateQR}
            style={{
              flex: 1,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Generate
          </button>
          <button
            onClick={clearQR}
            style={{
              flex: 1,
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {qrVisible && text && (
          <div ref={qrRef} style={{ textAlign: "center", marginTop: "1rem" }}>
            <QRCodeCanvas value={text} size={qrSize} fgColor={fgColor} bgColor={bgColor} />
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <button
                onClick={downloadQR}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Download
              </button>
              <button
                onClick={copyToClipboard}
                style={{
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Copy Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
