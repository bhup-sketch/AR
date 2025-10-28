'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    let mediaPlane: THREE.Mesh | null = null;
    let videoElement: HTMLVideoElement | null = null;

    // Create media plane
    const createMediaPlane = () => {
      const geometry = new THREE.PlaneGeometry(4, 3);
      const material = new THREE.MeshBasicMaterial({ transparent: true });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, -2);
      scene.add(plane);
      return plane;
    };

    // Load media based on type
    if (assetType === 'video') {
      videoElement = document.createElement('video');
      videoElement.src = assetUrl;
      videoElement.crossOrigin = 'anonymous';
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.playsInline = true;

      videoElement.addEventListener('loadeddata', () => {
        const videoTexture = new THREE.VideoTexture(videoElement!);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        mediaPlane = createMediaPlane();
        (mediaPlane.material as THREE.MeshBasicMaterial).map = videoTexture;

        videoElement!.play();
        setIsLoading(false);
      });

      videoElement.addEventListener('error', () => {
        setError('Failed to load video');
        setIsLoading(false);
      });
    } else if (assetType === 'image') {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        assetUrl,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;

          mediaPlane = createMediaPlane();
          (mediaPlane.material as THREE.MeshBasicMaterial).map = texture;
          setIsLoading(false);
        },
        undefined,
        () => {
          setError('Failed to load image');
          setIsLoading(false);
        }
      );
    }

    camera.position.set(0, 0, 5);

    // Animation loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    // Check for WebXR support and add AR button
    const checkXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr!.isSessionSupported('immersive-ar');
          if (supported) {
            // Create AR button
            const arButton = document.createElement('button');
            arButton.textContent = 'Start AR';
            arButton.className = 'absolute top-4 left-4 z-10 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors';
            arButton.onclick = async () => {
              try {
                const session = await navigator.xr!.requestSession('immersive-ar', {
                  requiredFeatures: ['hit-test'],
                  optionalFeatures: ['dom-overlay']
                });
                renderer.xr.setSession(session);
              } catch (err) {
                console.error('Failed to start AR session:', err);
              }
            };
            mountRef.current!.appendChild(arButton);
          }
        } catch (err) {
          console.error('WebXR not supported:', err);
        }
      }
    };

    checkXRSupport();
    animate();

    // Cleanup
    return () => {
      if (videoElement) {
        videoElement.pause();
      }
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
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
          <p>Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/50 rounded-lg p-3">
        <p>Point your camera at a flat surface and tap "Start AR" to place the media</p>
      </div>
    </div>
  );
}