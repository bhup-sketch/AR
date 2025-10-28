// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';

interface ARViewerProps {
  assetUrl: string;
  poster?: string;
  alt?: string;
  autoActivateAR?: boolean;
}

type AssetType = 'model' | 'video' | 'image' | 'unknown';

export default function ARViewer({ assetUrl, poster, alt = "AR Asset", autoActivateAR = false }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [assetType, setAssetType] = useState<AssetType>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getAssetType = (url: string): AssetType => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['glb', 'gltf'].includes(extension || '')) return 'model';
    if (['mp4', 'webm', 'mov'].includes(extension || '')) return 'video';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  useEffect(() => {
    const type = getAssetType(assetUrl);
    setAssetType(type);

    // Load model-viewer script if not already loaded
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.type = 'module';
      document.head.appendChild(script);
    }

    setIsLoading(false);
  }, [assetUrl]);

  useEffect(() => {
    if (autoActivateAR && !isLoading && assetType !== 'unknown') {
      // Auto-activate AR after a short delay to ensure model-viewer is ready
      const timer = setTimeout(() => {
        const arButton = document.querySelector('model-viewer button[slot="ar-button"]') as HTMLButtonElement;
        if (arButton) {
          arButton.click();
        }
      }, 2000); // Increased delay for better reliability
      return () => clearTimeout(timer);
    }
  }, [autoActivateAR, isLoading, assetType]);

  // Handle video textures in GLB models
  useEffect(() => {
    if (assetType === 'model' && modelViewerRef.current) {
      const modelViewer = modelViewerRef.current;

      // Listen for model load to apply video textures
      const handleModelLoad = () => {
        // Check if this is a video-textured model by looking for video elements in the model
        setTimeout(() => {
          // Find any video elements that might be part of the model
          const videos = modelViewer.shadowRoot?.querySelectorAll('video') || [];
          videos.forEach((video: HTMLVideoElement) => {
            if (!video.src && video.dataset.videoUrl) {
              video.src = video.dataset.videoUrl;
              video.crossOrigin = 'anonymous';
              video.loop = true;
              video.muted = false;
              video.playsInline = true;
              video.play().catch(err => {
                console.log('Video autoplay failed, user interaction required:', err);
              });
            }
          });

          // Alternative: Check for materials that should be video textures
          const materials = modelViewer.shadowRoot?.querySelectorAll('[data-video-texture]');
          materials.forEach((material: any) => {
            const videoUrl = material.dataset.videoTexture;
            if (videoUrl) {
              // Create video element and apply as texture
              const video = document.createElement('video');
              video.src = videoUrl;
              video.crossOrigin = 'anonymous';
              video.loop = true;
              video.muted = false;
              video.playsInline = true;
              video.style.display = 'none';
              document.body.appendChild(video);

              video.addEventListener('loadeddata', () => {
                video.play().catch(console.error);
              });

              // Store reference for cleanup
              (material as any)._arVideo = video;
            }
          });
        }, 1000); // Wait for model to fully load
      };

      modelViewer.addEventListener('load', handleModelLoad);
      return () => {
        modelViewer.removeEventListener('load', handleModelLoad);
        // Cleanup video elements
        const videos = document.querySelectorAll('video[data-ar-video-temp]');
        videos.forEach(video => video.remove());
      };
    }
  }, [assetType, assetUrl]);

  const renderModelViewer = () => {
    if (assetType === 'model') {
      // Check if this is a video-textured model (URL contains video indicators)
      const isVideoTextured = assetUrl.includes('video') || assetUrl.includes('campaign') || assetUrl.includes('bjp');

      return (
        <model-viewer
          ref={modelViewerRef}
          src={assetUrl}
          poster={poster}
          alt={alt}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate={!isVideoTextured} // Disable auto-rotate for video models
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          data-video-textured={isVideoTextured ? 'true' : 'false'}
        >
          <button
            slot="ar-button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            View in AR
          </button>
        </model-viewer>
      );
    }

    if (assetType === 'video') {
      return (
        <model-viewer
          ref={modelViewerRef}
          poster={poster || assetUrl}
          alt={alt}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
        >
          {/* Create a plane with video texture */}
          <div slot="poster" style={{ backgroundImage: `url(${assetUrl})`, backgroundSize: 'cover', width: '100%', height: '100%' }}></div>
          <button
            slot="ar-button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            View in AR
          </button>
        </model-viewer>
      );
    }

    if (assetType === 'image') {
      return (
        <model-viewer
          ref={modelViewerRef}
          poster={assetUrl}
          alt={alt}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
        >
          <button
            slot="ar-button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            View in AR
          </button>
        </model-viewer>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⚠️</div>
          <p>Unsupported asset type</p>
          <p className="text-sm text-gray-400 mt-2">Please use GLB/GLTF, MP4/WebM, or PNG/JPG files</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Loading asset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" data-testid="ar-viewer-container">
      {renderModelViewer()}
    </div>
  );
}