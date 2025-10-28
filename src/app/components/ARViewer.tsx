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

            // Get the pre-created video element
            const video = document.getElementById('video-source') as HTMLVideoElement;
            if (!video) {
              console.error('Video element not found');
              return;
            }

            // Wait for model to be ready
            const setupVideoTexture = async () => {
              try {
                console.log('Waiting for model to be ready...');
                await modelViewer.updateComplete;
                
                // Wait for the model to load
                await new Promise((resolve) => {
                  const checkModel = () => {
                    if (modelViewer.model) {
                      resolve(true);
                    } else {
                      setTimeout(checkModel, 100);
                    }
                  };
                  checkModel();
                });
                
                console.log('Model ready, accessing materials...');
                const material = modelViewer.model?.materials[0];
                
                if (material) {
                  console.log('Found material, applying video texture...');
                  
                  // Create a new texture from the video
                  const texture = new (window as any).THREE.VideoTexture(video);
                  texture.encoding = (window as any).THREE.sRGBEncoding;
                  
                  // Apply the texture to the material
                  material.map = texture;
                  material.needsUpdate = true;

                  // Start playing the video
                  video.addEventListener('loadeddata', () => {
                    console.log('Video loaded, attempting to play...');
                    video.play().then(() => {
                      console.log('Video playing successfully');
                      video.muted = false;
                    }).catch(err => {
                      console.error('Video autoplay failed:', err);
                    });
                  });

                  // Store reference for cleanup
                  modelViewer._arVideo = video;

                  // Set up click handler for the model viewer
                  modelViewer.addEventListener('click', () => {
                    if (video.paused) {
                      video.play().catch(console.error);
                    } else {
                      video.pause();
                    }
                  });

                } else {
                  console.error('No material found in the model');
                }
              } catch (error) {
                console.error('Error setting up video texture:', error);
              }
            };

            // Start the setup process
            setupVideoTexture();
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
            id="video-model-viewer"
            data-video-url={assetUrl}
            loading="eager"
            reveal="auto"
          >
            <div id="ar-prompt" slot="ar-prompt">
              Place the video in your space
            </div>
            
            <button
              slot="ar-button"
              className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors z-10"
            >
              View in AR
            </button>

            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
              <button
                id="play-button"
                className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg shadow-lg transition-colors"
                onClick={() => {
                  const video = modelViewerRef.current?._arVideo;
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
              >
                Play/Pause
              </button>
            </div>
          </model-viewer>

          {/* Video texture source - hidden but needed */}
          <video
            id="video-source"
            src={assetUrl}
            style={{ display: 'none' }}
            playsInline
            muted
            loop
            crossOrigin="anonymous"
            onError={(e) => console.error('Video error:', e)}
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