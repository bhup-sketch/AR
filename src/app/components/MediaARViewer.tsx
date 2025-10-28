'use client';

import { useEffect, useRef } from 'react';

interface MediaARViewerProps {
  assetUrl: string;
  assetType: 'video' | 'image';
  alt?: string;
}

export default function MediaARViewer({ assetUrl, assetType, alt = "AR Media" }: MediaARViewerProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear any existing content
    sceneRef.current.innerHTML = '';

    // Create A-Frame scene for MindAR
    const scene = document.createElement('a-scene');
    scene.setAttribute('mindar-image', 'imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/card.mind;');
    scene.setAttribute('color-space', 'sRGB');
    scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');

    // Create AR target
    const anchor = document.createElement('a-anchor');
    anchor.setAttribute('mindar-image-target', 'targetIndex: 0');

    // Create media entity based on type
    if (assetType === 'video') {
      const video = document.createElement('a-video');
      video.setAttribute('src', assetUrl);
      video.setAttribute('position', '0 0 0');
      video.setAttribute('width', '1');
      video.setAttribute('height', '1');
      video.setAttribute('rotation', '0 0 0');
      video.setAttribute('play-on-click', '');
      anchor.appendChild(video);
    } else if (assetType === 'image') {
      const image = document.createElement('a-image');
      image.setAttribute('src', assetUrl);
      image.setAttribute('position', '0 0 0');
      image.setAttribute('width', '1');
      image.setAttribute('height', '1');
      image.setAttribute('rotation', '0 0 0');
      anchor.appendChild(image);
    }

    scene.appendChild(anchor);
    sceneRef.current.appendChild(scene);

    // Load A-Frame and MindAR scripts dynamically
    const loadScripts = async () => {
      if (!document.querySelector('script[src*="aframe"]')) {
        const aframeScript = document.createElement('script');
        aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
        document.head.appendChild(aframeScript);

        await new Promise((resolve) => {
          aframeScript.onload = resolve;
        });
      }

      if (!document.querySelector('script[src*="mind-ar"]')) {
        const mindarScript = document.createElement('script');
        mindarScript.src = 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/dist/mindar-image.prod.js';
        document.head.appendChild(mindarScript);

        await new Promise((resolve) => {
          mindarScript.onload = resolve;
        });
      }

      if (!document.querySelector('script[src*="mindar-image-aframe"]')) {
        const mindarAframeScript = document.createElement('script');
        mindarAframeScript.src = 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/dist/mindar-image-aframe.prod.js';
        document.head.appendChild(mindarAframeScript);

        await new Promise((resolve) => {
          mindarAframeScript.onload = resolve;
        });
      }
    };

    loadScripts();

    // Cleanup
    return () => {
      if (sceneRef.current) {
        sceneRef.current.innerHTML = '';
      }
    };
  }, [assetUrl, assetType]);

  return (
    <div className="w-full h-full relative">
      <div ref={sceneRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 right-4 text-center text-white text-sm bg-black/70 rounded-lg p-4">
        <p className="mb-2">🎯 Point your camera at a marker to see the {assetType}</p>
        <p className="text-xs text-gray-300">
          Download a marker image from the MindAR examples to test this AR experience
        </p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <a
          href="https://hiukim.github.io/mind-ar-js-doc/examples/interactive"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          View Marker Examples
        </a>
      </div>
    </div>
  );
}