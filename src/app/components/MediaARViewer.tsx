'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create video element for media
    let mediaElement: HTMLVideoElement | HTMLImageElement | null = null;

    if (assetType === 'video') {
      const video = document.createElement('video');
      video.src = assetUrl;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      mediaElement = video;

      video.addEventListener('loadeddata', () => {
        video.play();
        setIsLoading(false);
      });

      video.addEventListener('error', () => {
        setError('Failed to load video');
        setIsLoading(false);
      });
    } else if (assetType === 'image') {
      const img = document.createElement('img');
      img.src = assetUrl;
      img.crossOrigin = 'anonymous';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      mediaElement = img;

      img.addEventListener('load', () => {
        setIsLoading(false);
      });

      img.addEventListener('error', () => {
        setError('Failed to load image');
        setIsLoading(false);
      });
    }

    if (mediaElement) {
      // Create a wrapper for the media
      const mediaWrapper = document.createElement('div');
      mediaWrapper.style.position = 'relative';
      mediaWrapper.style.width = '100%';
      mediaWrapper.style.height = '100%';
      mediaWrapper.appendChild(mediaElement);

      containerRef.current.appendChild(mediaWrapper);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [assetUrl, assetType]);

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

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Loading {assetType}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full bg-black rounded-lg overflow-hidden" />
      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/70 rounded-lg p-3">
        <p>This {assetType} is displayed in 2D preview mode. For AR placement on surfaces, use 3D model files (.glb/.gltf) instead.</p>
      </div>
    </div>
  );
}