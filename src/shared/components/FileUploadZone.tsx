'use client';

import React, { useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  accept?: string;
  selectedFile?: File | null;
  selectedFiles?: File[];
  multiple?: boolean;
  maxFiles?: number;
  onClear?: () => void;
}

export default function FileUploadZone({
  onFileSelect,
  onFilesSelect,
  accept = '.csv,.pdf,.jpg,.jpeg,.png',
  selectedFile,
  selectedFiles,
  multiple = false,
  maxFiles = 5,
  onClear,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && onFilesSelect) {
      const fileArray = Array.from(files).slice(0, maxFiles);
      onFilesSelect(fileArray);
    } else {
      const file = files[0];
      if (file) onFileSelect(file);
    }
  };

  const hasFiles = multiple ? (selectedFiles && selectedFiles.length > 0) : !!selectedFile;

  return (
    <div
      onClick={handleClick}
      className={`relative group cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all duration-200 ${
        hasFiles
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
          : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-2)]'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />

      {/* Multiple files selected */}
      {multiple && selectedFiles && selectedFiles.length > 0 ? (
        <div className="flex flex-col items-center gap-3 animate-fade-in w-full">
          <div className="w-12 h-12 bg-[var(--color-primary)]/15 flex items-center justify-center text-[var(--color-primary)] border-2 border-[var(--color-primary)]">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            {selectedFiles.length} / {maxFiles} files
          </p>
          <div className="w-full space-y-1 max-w-sm">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] px-3 py-1.5 border-2 border-[var(--color-border)]">
                <span className="truncate mr-2">{f.name}</span>
                <span className="text-[var(--color-text-muted)] flex-shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="mt-1 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 flex items-center gap-1 px-3 py-1.5 border-2 border-[var(--color-accent)] transition-colors uppercase tracking-wider"
            >
              <X size={14} /> Remove All
            </button>
          )}
        </div>
      ) : selectedFile ? (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <div className="w-12 h-12 bg-[var(--color-primary)]/15 flex items-center justify-center text-[var(--color-primary)] border-2 border-[var(--color-primary)]">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {selectedFile.name}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>

          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="mt-2 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 flex items-center gap-1 px-3 py-1.5 border-2 border-[var(--color-accent)] transition-colors uppercase tracking-wider"
            >
              <X size={14} /> Remove
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-[var(--color-surface-2)] group-hover:bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors border-2 border-[var(--color-border)]">
            {multiple ? <ImagePlus className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
            {multiple ? `Click to upload images (max ${maxFiles})` : 'Click to upload statement'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {multiple ? 'Supports PNG, JPG images' : 'Supports PDF, CSV, Images'}
          </p>
        </div>
      )}
    </div>
  );
}
