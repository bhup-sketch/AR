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
    if (modelViewerRef.current) {
      const modelViewer = modelViewerRef.current;
      const isVideoModel = assetType === 'video';

      // Add error handler for model loading
      const handleError = (event: any) => {
        console.error('Model loading error:', event.detail);
      };

      modelViewer.addEventListener('error', handleError);

      // Add debug logging for model loading
      const handleModelVisibility = () => {
        console.log('Model visibility:', modelViewer.modelIsVisible);
      };

      modelViewer.addEventListener('model-visibility', handleModelVisibility);

      // Listen for model load to apply video textures
      const handleModelLoad = () => {
        console.log('Model loaded, applying video texture...');
        setTimeout(() => {
          if (isVideoModel) {
            console.log('Setting up video texture for plane...');
            console.log('Video URL:', modelViewer.dataset.videoUrl);

            // Create and set up the video element for the plane
            const video = document.createElement('video');
            video.src = assetUrl; // Use assetUrl directly instead of dataset
            video.crossOrigin = 'anonymous';
            video.loop = true;
            video.muted = true; // Start muted to allow autoplay
            video.playsInline = true;
            video.style.display = 'none';
            document.body.appendChild(video);

            console.log('Video element created:', video);

            // Wait for model to be ready
            const setupVideoTexture = async () => {
              try {
                console.log('Waiting for model to be ready...');
                await modelViewer.updateComplete;
                
                console.log('Model ready, accessing materials...');
                const material = modelViewer.model?.materials[0];
                
                if (material) {
                  console.log('Found material, applying video texture...');
                  
                  // Create a new texture from the video
                  const texture = new modelViewer.textureLoader.VideoTexture(video);
                  texture.encoding = modelViewer.textureLoader.sRGBEncoding;
                  
                  // Apply the texture to the material
                  material.pbrMetallicRoughness.baseColorTexture = texture;
                  material.needsUpdate = true;

                  // Start playing the video
                  video.addEventListener('loadeddata', () => {
                    console.log('Video loaded, attempting to play...');
                    video.play().then(() => {
                      console.log('Video playing successfully');
                      // Once playing, unmute if needed
                      video.muted = false;
                    }).catch(err => {
                      console.error('Video autoplay failed:', err);
                      // Add click to play fallback
                      modelViewer.addEventListener('click', () => {
                        video.muted = false;
                        video.play().catch(console.error);
                      }, { once: true });
                    });
                  });

                  video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                  });
                } else {
                  console.error('No material found in the model');
                }
              } catch (error) {
                console.error('Error setting up video texture:', error);
              }
            };

            setupVideoTexture();

            // Store reference for cleanup
            modelViewer._arVideo = video;
          } else if (assetType === 'model') {
            // Handle video textures in regular models
            const videos = modelViewer.shadowRoot?.querySelectorAll('video') || [];
            videos.forEach((video: HTMLVideoElement) => {
              if (!video.src && video.dataset.videoUrl) {
                video.src = video.dataset.videoUrl;
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = false;
                video.playsInline = true;
                video.play().catch(console.error);
              }
            });
          }
        }, 1000); // Wait for model to fully load
      };

      modelViewer.addEventListener('load', handleModelLoad);
      return () => {
        modelViewer.removeEventListener('load', handleModelLoad);
        modelViewer.removeEventListener('error', handleError);
        modelViewer.removeEventListener('model-visibility', handleModelVisibility);
        // Cleanup video elements
        if (modelViewer._arVideo) {
          modelViewer._arVideo.remove();
        }
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
      // For video, we'll create a plane model with the video as a texture
      return (
        <div className="relative w-full h-full">
          <model-viewer
            ref={modelViewerRef}
            src="/models/video_plane.glb"
            alt={alt}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate={false}
            shadow-intensity="1"
            exposure="1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
            data-video-url={assetUrl}
            loading="eager"
            reveal="auto"
          >
            <button
              slot="ar-button"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              View in AR
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center bg-black/50 text-white text-sm rounded-lg p-2">
              Tap to play/pause video
            </div>
          </model-viewer>
          {/* Hidden video element for loading state check */}
          <video 
            src={assetUrl}
            style={{ display: 'none' }}
            playsInline
            muted
            crossOrigin="anonymous"
            onError={(e) => console.error('Preview video error:', e)}
          />
        </div>
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