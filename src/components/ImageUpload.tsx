import React, { useState, useRef, useCallback } from 'react'
import { ecommerceService, getImageUrl } from '../services/api'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getDefaultProductImage = () => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    ]
    return defaultImages[Math.floor(Math.random() * defaultImages.length)]
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please use JPG, PNG, GIF, or WebP.`)
        return false
      }
      
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    if (images.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. Current: ${images.length}`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadResult = await ecommerceService.uploadImages(validFiles)
      
      if (uploadResult.urls && uploadResult.urls.length > 0) {
        // Use the helper function to get proper URLs
        const fullUrls = uploadResult.urls.map((url: string) => getImageUrl(url))
        onImagesChange([...images, ...fullUrls])
        setUploadProgress(100)
        
        if (uploadResult.errors && uploadResult.errors.length > 0) {
          alert(`Some files failed to upload:\n${uploadResult.errors.join('\n')}`)
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [images, onImagesChange, maxImages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const handleAddUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        alert(`You can only have up to ${maxImages} images.`)
        return
      }
      onImagesChange([...images, url.trim()])
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Product Images</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading || images.length >= maxImages}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Upload Files
          </button>
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={images.length >= maxImages}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add URL
          </button>
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-300 bg-gray-50'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={images.length < maxImages ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="text-yellow-600 text-lg">📤</div>
            <p className="text-yellow-600 font-medium">Uploading images...</p>
            {uploadProgress > 0 && (
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : isDragOver ? (
          <div className="space-y-2">
            <div className="text-blue-500 text-lg">📥</div>
            <p className="text-blue-600 font-medium">Drop images here</p>
            <p className="text-sm text-blue-500">JPG, PNG, GIF, WebP up to 5MB each</p>
          </div>
        ) : images.length >= maxImages ? (
          <div className="space-y-2">
            <div className="text-gray-400 text-lg">📷</div>
            <p className="text-gray-500">Maximum {maxImages} images reached</p>
            <p className="text-sm text-gray-400">Remove some images to add more</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 text-lg">📷</div>
            <p className="text-gray-600 font-medium">Drag & drop images here</p>
            <p className="text-sm text-gray-500">or click to browse files</p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP up to 5MB each</p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={getImageUrl(url)} 
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = getDefaultProductImage()
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                ×
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-400 text-sm">
            No images added. A default image will be assigned automatically.
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {images.length}/{maxImages} images • Drag & drop or click to upload • Max 5MB per file
      </div>
    </div>
  )
}
