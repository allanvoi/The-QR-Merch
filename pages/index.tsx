import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRQuoteGenerator() {
  const [text, setText] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const qrRef = useRef(null);

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginBottom: "1rem" }}>QR Code Generator</h1>
        <input
          style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          placeholder="Enter your quote or message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={generateQR}
            style={{ flex: 1, padding: "0.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Generate
          </button>
          <button
            onClick={clearQR}
            style={{ flex: 1, padding: "0.5rem", backgroundColor: "#f87171", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Clear
          </button>
        </div>

        {qrVisible && text && (
          <div ref={qrRef} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <QRCodeCanvas value={text} size={256} />
            <button
              onClick={downloadQR}
              style={{ marginTop: "1rem", padding: "0.5rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

