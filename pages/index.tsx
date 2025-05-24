import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRQuoteGenerator() {
  const [text, setText] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQR = () => {
    if (text.trim()) {
      setQrVisible(true);
    } else {
      setQrVisible(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logo = new Image();
    logo.crossOrigin = "anonymous"; // Ensure CORS
    logo.src = "https://i.imgur.com/tHoIHUt.png"; // Your logo URL

    logo.onload = () => {
      const logoSize = qrSize * 0.2;
      const x = (qrSize - logoSize) / 2;
      const y = (qrSize - logoSize) / 2;
      ctx.drawImage(logo, x, y, logoSize, logoSize);

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-code.png";
      link.click();
    };
  };

  const clearQR = () => {
    setText("");
    setQrVisible(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          QR Code Generator
        </h1>
        <input
          style={{
            padding: "0.5rem",
            width: "100%",
            marginBottom: "1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          placeholder="Enter your quote or message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            title="Foreground color"
          />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            title="Background color"
          />
          <input
            type="number"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            min={64}
            max={512}
            step={32}
            style={{ width: "60px" }}
            title="QR Code size"
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={generateQR}
            style={{
              flex: 1,
              padding: "0.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Generate
          </button>
          <button
            onClick={clearQR}
            style={{
              flex: 1,
              padding: "0.5rem",
              backgroundColor: "#f87171",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {qrVisible && text && (
          <div
            ref={qrRef}
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <QRCodeCanvas
              value={text}
              size={qrSize}
              fgColor={fgColor}
              bgColor={bgColor}
              includeMargin={true}
              level="H"
            />
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
            >
              <button
                onClick={downloadQR}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Download QR
              </button>
              <button
                onClick={copyToClipboard}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  backgroundColor: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
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
