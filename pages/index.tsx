import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import toast, { Toaster } from "react-hot-toast";
import { getCredits, incrementCredits, MAX_GUEST_CREDITS } from "../utils/creditLimiter";

const IndexPage = () => {
  const [inputText, setInputText] = useState("");
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast.error("Please enter a quote or phrase");
      return;
    }

    if (inputText.length > 100) {
      toast.error("Limit your quote to 100 characters.");
      return;
    }

    const currentCredits = getCredits();
    if (currentCredits >= MAX_GUEST_CREDITS) {
      toast.error("Guest limit reached. Please sign in to generate more QR codes.");
      return;
    }

    const qr = new QRCodeStyling({
      width: 256,
      height: 256,
      type: "svg",
      data: inputText,
      image: "",
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000000",
      },
    });

    setQrCode(qr);
    incrementCredits();
    toast.success("QR code generated!");
  };

  const handleDownload = () => {
    if (qrCode) {
      qrCode.download({ name: "qr-quote", extension: "png" });
    }
  };

  useEffect(() => {
    if (qrCode && qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.append(qrRef.current);
    }
  }, [qrCode]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">QR Quote Generator</h1>

        <textarea
          className="w-full p-3 border border-gray-300 rounded-md resize-none"
          placeholder="Enter your quote (max 100 characters)"
          maxLength={100}
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Generate QR
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Download
          </button>
        </div>

        <div ref={qrRef} id="qr-container" className="mt-6 flex justify-center" />
      </div>
    </div>
  );
};

export default IndexPage;
