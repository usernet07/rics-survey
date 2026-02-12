import { useState, useRef } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';
import type { Photo } from '../types/survey';

interface Props {
  photos: Photo[];
  onCapture: (file: File, description: string) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  disabled?: boolean;
}

export default function PhotoCapture({ photos, onCapture, onDelete, disabled }: Props) {
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onCapture(file, description || `Photo ${photos.length + 1}`);
      setDescription('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Photos</label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={`${apiBase}/uploads/${photo.filename}`}
                alt={photo.description}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {photo.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">{photo.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <ImageIcon size={16} />
          <span>No photos captured yet</span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Photo description (optional)"
          className="flex-1 min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontSize: '16px' }}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="min-h-[48px] min-w-[48px] px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          <Camera size={20} />
          <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Capture'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
