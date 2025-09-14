import React, { useState, useEffect } from 'react'
import { ecommerceService, getImageUrl } from '../services/api'
import '../styles/AssetManager.css'

interface AssetManagerProps {
  onSelectAsset: (url: string) => void
  onClose: () => void
  allowMultiple?: boolean
  acceptedTypes?: string[]
}

interface UploadedAsset {
  id: string
  filename: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

const AssetManager: React.FC<AssetManagerProps> = ({
  onSelectAsset,
  onClose,
  allowMultiple = false,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [assets, setAssets] = useState<UploadedAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all')

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    setLoading(true)
    try {
      // Mock assets for now - replace with actual API call
      const mockAssets: UploadedAsset[] = [
        {
          id: '1',
          filename: 'product-1.jpg',
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
          size: 245760,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          filename: 'hero-bg.jpg',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
          size: 512000,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '3',
          filename: 'product-2.jpg',
          url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
          size: 189440,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '4',
          filename: 'feature-bg.jpg',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
          size: 334080,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }
      ]
      setAssets(mockAssets)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    const validFiles = Array.from(files).filter(file => 
      acceptedTypes.includes(file.type)
    )

    if (validFiles.length === 0) {
      alert('Please select valid image files')
      return
    }

    setUploading(true)
    try {
      const uploadResults = await ecommerceService.uploadImages(validFiles)
      
      const newAssets: UploadedAsset[] = uploadResults.map((result: any) => ({
        id: result.id || Date.now().toString(),
        filename: result.filename,
        url: getImageUrl(result.url),
        size: result.size,
        type: result.type,
        uploadedAt: new Date().toISOString()
      }))

      setAssets(prev => [...newAssets, ...prev])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleAssetSelect = (asset: UploadedAsset) => {
    if (allowMultiple) {
      setSelectedAssets(prev => 
        prev.includes(asset.id) 
          ? prev.filter(id => id !== asset.id)
          : [...prev, asset.id]
      )
    } else {
      onSelectAsset(asset.url)
      onClose()
    }
  }

  const handleConfirmSelection = () => {
    if (allowMultiple && selectedAssets.length > 0) {
      const selectedUrls = assets
        .filter(asset => selectedAssets.includes(asset.id))
        .map(asset => asset.url)
      onSelectAsset(selectedUrls.join(','))
    }
    onClose()
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || 
      (filterType === 'image' && asset.type.startsWith('image/'))
    return matchesSearch && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="asset-manager-overlay">
      <div className="asset-manager-modal">
        <div className="asset-manager-header">
          <h2>Asset Manager</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="asset-manager-toolbar">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="asset-search"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="asset-filter"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div className="upload-section">
            <input
              type="file"
              id="asset-upload"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
            />
            <label htmlFor="asset-upload" className="upload-button">
              {uploading ? 'Uploading...' : '📁 Upload Files'}
            </label>
          </div>
        </div>

        <div className="asset-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="empty-state">
              <p>No assets found</p>
              <label htmlFor="asset-upload" className="upload-button-large">
                Upload your first asset
              </label>
            </div>
          ) : (
            filteredAssets.map(asset => (
              <div
                key={asset.id}
                className={`asset-item ${selectedAssets.includes(asset.id) ? 'selected' : ''}`}
                onClick={() => handleAssetSelect(asset)}
              >
                <div className="asset-preview">
                  {asset.type.startsWith('image/') ? (
                    <img src={asset.url} alt={asset.filename} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  {allowMultiple && (
                    <div className="selection-indicator">
                      {selectedAssets.includes(asset.id) && '✓'}
                    </div>
                  )}
                </div>
                <div className="asset-info">
                  <div className="asset-name" title={asset.filename}>
                    {asset.filename}
                  </div>
                  <div className="asset-meta">
                    {formatFileSize(asset.size)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {allowMultiple && selectedAssets.length > 0 && (
          <div className="asset-manager-footer">
            <p>{selectedAssets.length} asset(s) selected</p>
            <button onClick={handleConfirmSelection} className="confirm-button">
              Use Selected Assets
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssetManager