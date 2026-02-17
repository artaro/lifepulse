'use client';

import React from 'react';

interface LoadingSkeletonProps {
  height?: number | string;
  width?: number | string;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
}

export default function LoadingSkeleton({
  height = 20,
  width = '100%',
  variant = 'text',
  className = '',
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    text: 'rounded-md',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  );
}
