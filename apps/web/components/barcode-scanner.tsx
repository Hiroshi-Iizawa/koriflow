"use client"

import { useState, useRef, useEffect } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Button, Input, Label } from "@koriflow/ui"

interface BarcodeScannerProps {
  onScan: (lotCode: string, deltaQty: number) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [deltaQty, setDeltaQty] = useState<number>(0)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader>()

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader()
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset()
      }
    }
  }, [])

  const startScan = async () => {
    if (!codeReader.current || !videoRef.current) return

    try {
      setScanning(true)
      setError("")
      
      const result = await codeReader.current.decodeOnceFromVideoDevice(
        undefined,
        videoRef.current
      )
      
      if (result) {
        setScannedCode(result.getText())
        setScanning(false)
      }
    } catch (err) {
      setError("Failed to scan barcode")
      setScanning(false)
    }
  }

  const stopScan = () => {
    if (codeReader.current) {
      codeReader.current.reset()
    }
    setScanning(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scannedCode && deltaQty !== 0) {
      onScan(scannedCode, deltaQty)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Barcode Scanner</h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div className="aspect-video border rounded-lg overflow-hidden bg-gray-100">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: scanning ? "block" : "none" }}
            />
            {!scanning && (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Click "Start Scan" to begin
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-2">
            {!scanning ? (
              <Button onClick={startScan} className="flex-1">
                Start Scan
              </Button>
            ) : (
              <Button onClick={stopScan} variant="outline" className="flex-1">
                Stop Scan
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lotCode">Lot Code</Label>
              <Input
                id="lotCode"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Scanned or manually entered"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deltaQty">Quantity Change</Label>
              <Input
                id="deltaQty"
                type="number"
                step="0.001"
                value={deltaQty}
                onChange={(e) => setDeltaQty(parseFloat(e.target.value) || 0)}
                placeholder="Enter +/- quantity"
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={!scannedCode || deltaQty === 0}>
                Record Move
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}