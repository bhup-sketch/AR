'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assetType === 'video' && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedData = () => {
        setIsLoading(false);
        // Auto-play video
        video.play().catch(err => {
          console.error('Auto-play failed:', err);
          setError('Tap to play video');
        });
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = () => {
        setError('Failed to load video');
        setIsLoading(false);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    } else if (assetType === 'image' && imageRef.current) {
      const img = imageRef.current;

      const handleLoad = () => setIsLoading(false);
      const handleError = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }
  }, [assetType]);

  const handleVideoClick = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().catch(console.error);
    }
  };

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
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      {assetType === 'video' ? (
        <video
          ref={videoRef}
          src={assetUrl}
          className="w-full h-full object-contain"
          controls
          playsInline
          loop
          muted={false}
          onClick={handleVideoClick}
          style={{ backgroundColor: 'black' }}
        />
      ) : (
        <img
          ref={imageRef}
          src={assetUrl}
          alt={alt}
          className="w-full h-full object-contain"
          style={{ backgroundColor: 'black' }}
        />
      )}

      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/70 rounded-lg p-3">
        <p>
          {assetType === 'video'
            ? 'Video loaded successfully. Use device controls to play/pause.'
            : 'Image loaded successfully in AR-compatible format.'
          }
        </p>
        <p className="text-xs text-gray-300 mt-1">
          For true AR placement on surfaces, use 3D model files (.glb/.gltf)
        </p>
      </div>
    </div>
  );
}