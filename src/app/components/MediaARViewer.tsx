'use client';

import { useEffect, useRef, useState } from 'react';
import { createXRStore, ARButton, XR, useXR, Interactive } from '@react-three/xr';
import { Plane, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

function MediaPlane({ assetUrl, assetType, onPlaced }: {
  assetUrl: string;
  assetType: 'video' | 'image';
  onPlaced: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const { session } = useXR();

  useEffect(() => {
    if (assetType === 'video') {
      const video = document.createElement('video');
      video.src = assetUrl;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = false; // Allow audio in AR
      video.playsInline = true;
      video.preload = 'auto';

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;

      video.addEventListener('loadeddata', () => {
        video.play().catch(console.error);
        setTexture(videoTexture);
      });

      video.addEventListener('error', (e) => {
        console.error('Video load error:', e);
      });

      return () => {
        video.pause();
        videoTexture.dispose();
      };
    } else if (assetType === 'image') {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      loader.load(
        assetUrl,
        (loadedTexture) => {
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.generateMipmaps = false;
          setTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.error('Image load error:', error);
        }
      );
    }
  }, [assetUrl, assetType]);

  const handleTap = () => {
    if (!isPlaced && session) {
      setIsPlaced(true);
      onPlaced();
    }
  };

  if (!texture) {
    return (
      <Interactive onSelect={handleTap}>
        <Plane ref={meshRef} args={[2, 1.5]} position={[0, 0, -1]}>
          <meshBasicMaterial color="#4a5568" />
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Tap to place {assetType}
          </Text>
        </Plane>
      </Interactive>
    );
  }

  return (
    <Interactive onSelect={handleTap}>
      <Plane ref={meshRef} args={[2, 1.5]} position={[0, 0, -1]}>
        <meshBasicMaterial map={texture} transparent />
      </Plane>
    </Interactive>
  );
}

function ARScene({ assetUrl, assetType }: { assetUrl: string; assetType: 'video' | 'image' }) {
  const [isPlaced, setIsPlaced] = useState(false);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 1, 1]} intensity={0.8} />

      {!isPlaced && (
        <Text
          position={[0, 1, -1]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Point at a surface and tap to place
        </Text>
      )}

      <MediaPlane
        assetUrl={assetUrl}
        assetType={assetType}
        onPlaced={() => setIsPlaced(true)}
      />
    </>
  );
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const xrStore = createXRStore();

  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setIsSupported(supported);
        setIsLoading(false);
      }).catch(() => {
        setError('WebXR not supported');
        setIsLoading(false);
      });
    } else {
      setError('WebXR not available');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Checking AR support...</p>
        </div>
      </div>
    );
  }

  if (error || !isSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📱</div>
          <p className="mb-2">AR not supported on this device</p>
          <p className="text-sm text-gray-400 mb-4">Try using a mobile device with AR support</p>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> {assetType === 'video' ? 'Videos' : 'Images'} require AR-capable devices for 3D placement.
              Use 3D model files (.glb/.gltf) for the best AR experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 70 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <XR store={xrStore}>
          <ARScene assetUrl={assetUrl} assetType={assetType} />
        </XR>
      </Canvas>

      <div className="absolute top-4 left-4 z-10">
        <ARButton store={xrStore} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Start AR
        </ARButton>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/70 rounded-lg p-3">
        <p>Point your camera at a flat surface and tap the {assetType} to place it in the real world</p>
      </div>
    </div>
  );
}