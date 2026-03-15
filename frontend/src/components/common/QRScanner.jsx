'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' or 'file'
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scannerMode === 'camera') {
      // Initialize camera scanner
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
        },
        (error) => {
          // Ignore continuous scanning errors
          console.log(error);
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [scannerMode, onScan]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onError(error.message || 'Failed to scan QR code from image');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setScannerMode('camera')}
          className={`btn flex-1 ${scannerMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📷 Camera
        </button>
        <button
          onClick={() => setScannerMode('file')}
          className={`btn flex-1 ${scannerMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📁 Upload Image
        </button>
      </div>

      {scannerMode === 'camera' && (
        <div>
          <div id="qr-reader" className="w-full"></div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}

      {scannerMode === 'file' && (
        <div>
          <div id="qr-reader-file" className="hidden"></div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-file-input"
            />
            <label
              htmlFor="qr-file-input"
              className="cursor-pointer inline-block"
            >
              <div className="text-6xl mb-4">📸</div>
              <p className="text-lg font-medium mb-2">Upload QR Code Image</p>
              <p className="text-sm text-gray-600 mb-4">
                Click to select an image containing a QR code
              </p>
              <span className="btn btn-primary">
                Choose Image
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
