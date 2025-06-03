"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { X, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void
  selectedImage: string | null
}

export default function ImageUploader({ onImageUpload, selectedImage }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          onImageUpload(result)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items)
      const imageItem = items.find((item) => item.type.startsWith("image/"))

      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          handleFile(file)
        }
      }
    },
    [handleFile],
  )

  const removeImage = useCallback(() => {
    onImageUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onImageUpload])

  return (
    <div className="space-y-4">
      {selectedImage ? (
        <div className="relative">
          <div className="relative bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Uploaded passport photo"
              className="w-full h-64 object-contain rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Photo uploaded successfully. You can upload a different photo if needed.
          </p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                isDragOver ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <ImageIcon className={`w-8 h-8 ${isDragOver ? "text-blue-600" : "text-gray-400"}`} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Passport Photo</h3>
              <p className="text-gray-600 mb-4">Drag and drop, paste (Ctrl+V), or click to browse</p>

              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-3 py-1 rounded-full">JPG</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">PNG</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">WEBP</span>
              </div>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a high-resolution image</li>
          <li>• Ensure good lighting with no shadows</li>
          <li>• Face the camera directly with a neutral expression</li>
          <li>• Use a plain white or light-colored background</li>
        </ul>
      </div>
    </div>
  )
}
