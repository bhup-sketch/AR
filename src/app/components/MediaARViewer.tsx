'use client';

import { useState } from 'react';
import ARViewer from './ARViewer';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const [error, setError] = useState('');

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="mb-2">{error}</p>
          <p className="text-sm text-gray-400">Please check the URL and try again</p>
        </div>
      </div>
    );
  }

  // Use ARViewer with the video plane model for videos
  if (assetType === 'video') {
    return (
      <div className="w-full h-full relative">
        <ARViewer
          assetUrl={assetUrl}
          alt={alt}
          autoActivateAR={false}
        />
      </div>
    );
  }

  // For images, maintain the current behavior
  return (
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      <img
        src={assetUrl}
        alt={alt}
        className="w-full h-full object-contain"
        style={{ backgroundColor: 'black' }}
        onError={() => setError('Failed to load image')}
      />
      
      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/70 rounded-lg p-3">
        <p>Image loaded successfully in AR-compatible format.</p>
        <p className="text-xs text-gray-300 mt-1">
          For true AR placement on surfaces, use 3D model files (.glb/.gltf)
        </p>
      </div>
    </div>
  );
}