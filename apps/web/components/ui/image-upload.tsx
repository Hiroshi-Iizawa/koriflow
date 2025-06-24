'use client'

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@koriflow/ui"
import { cn } from "@lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (value: string | null) => void
  className?: string
  maxSize?: number // MB
  accept?: string
  placeholder?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  className, 
  maxSize = 5,
  accept = "image/*",
  placeholder = "商品画像をアップロード"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`ファイルサイズは${maxSize}MB以下にしてください`)
      return
    }

    setIsUploading(true)
    try {
      // Convert to base64 for now (in production, upload to cloud storage)
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        onChange(result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File upload error:', error)
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden border border-kori-300 bg-kori-50">
            <img
              src={value}
              alt="商品画像"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="h-4 w-4 mr-1" />
                削除
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:border-blue-400 hover:bg-blue-50/50",
            isDragging ? "border-blue-500 bg-blue-50" : "border-kori-300 bg-kori-50/30"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onClick={handleClick}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              ) : (
                <div className="p-3 bg-blue-100 rounded-full">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-kori-700">
                {isUploading ? "アップロード中..." : placeholder}
              </p>
              <p className="text-xs text-kori-500">
                ドラッグ&ドロップ、またはクリックしてファイルを選択
              </p>
              <p className="text-xs text-kori-400">
                PNG, JPG, WEBP (最大{maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}