'use client';

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  selectedFile?: File | null;
  onClear?: () => void;
}

export default function FileUploadZone({
  onFileSelect,
  accept = '.csv,.pdf,.jpg,.jpeg,.png',
  selectedFile,
  onClear,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative group cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200 ${
        selectedFile 
          ? 'border-indigo-500 bg-indigo-50/50' 
          : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {selectedFile.name}
          </p>
          <p className="text-xs text-gray-500">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <X size={14} /> Remove
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">
            Click to upload statement
          </p>
          <p className="text-xs text-gray-400">
            Supports PDF, CSV, Images
          </p>
        </div>
      )}
    </div>
  );
}
