'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  helperText = 'PNG, JPG, or WEBP up to 4MB (Hosted via ImgBB)',
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size exceeds 4MB serverless upload limit.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success(res.message || 'Image uploaded successfully!');
      } else {
        toast.error('Failed to get uploaded image URL.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
        {label}
      </label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-rose-200 aspect-[16/9] max-h-56 bg-slate-50 group">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 shadow text-xs font-medium"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-rose-50/40 hover:bg-rose-50/70"
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
              <p className="text-xs font-medium text-rose-700">Uploading image to ImgBB...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
