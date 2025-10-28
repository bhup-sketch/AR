'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PRELOADED_ASSETS = [
  {
    name: 'Running Soldier Animated',
    url: 'https://res.cloudinary.com/dyehf2ylq/image/upload/v1761629376/scp_unity__mtf_soldier_iaoeqd.glb',
    type: '3D Model',
    description: 'Animated soldier model'
  },
  {
    name: 'Low Poly SUV',
    url: 'https://res.cloudinary.com/dyehf2ylq/image/upload/v1761129953/lowpoly_generic_suv_onyung.glb',
    type: '3D Model',
    description: 'Detailed car model'
  },
  {
    name: '1967 Chevrolet Camaro SS',
    url: 'https://res.cloudinary.com/dyehf2ylq/image/upload/v1761628678/1967_chevrolet_camaro_ss_rorfct.glb',
    type: '3D Model',
    description: 'Classic muscle car'
  },
  {
    name: 'Demo Video 1',
    url: 'https://res.cloudinary.com/dyehf2ylq/video/upload/v1761303293/adviz/nvbnvbmvbm/nhazytcv83xnclnbgwy4.mp4',
    type: 'Video',
    description: 'Sample video texture'
  },
  {
    name: 'Demo Video 2',
    url: 'https://res.cloudinary.com/dyehf2ylq/video/upload/v1761303293/adviz/nvbnvbmvbm/nhazytcv83xnclnbgwy4.mp4',
    type: 'Video',
    description: 'Sample video texture'
  },
  {
    name: 'Demo Image',
    url: 'https://res.cloudinary.com/dyehf2ylq/image/upload/v1761628840/asd_o6gnak.jpg',
    type: 'Image',
    description: 'Sample image texture'
  }
];

export default function Home() {
  const [assetUrl, setAssetUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getAssetType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['glb', 'gltf'].includes(extension || '')) return 'model';
    if (['mp4', 'webm', 'mov'].includes(extension || '')) return 'video';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!assetUrl.trim()) {
      setError('Please enter an asset URL');
      return;
    }

    if (!validateUrl(assetUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    const assetType = getAssetType(assetUrl);
    if (assetType === 'unknown') {
      setError('Unsupported file format. Please use GLB/GLTF for 3D models, MP4/WebM for videos, or PNG/JPG for images.');
      return;
    }

    // Redirect to AR experience with URL parameter
    router.push(`/ar?url=${encodeURIComponent(assetUrl)}`);
  };

  const handlePreloadedAsset = (url: string) => {
    router.push(`/ar?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AR Asset Loader
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience 3D models, videos, and images in Augmented Reality. Choose from our pre-loaded assets or paste your own URL.
          </p>
        </div>

        {/* Custom URL Input Section */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-center">Load Custom Asset</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="url"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://example.com/your-asset.glb"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors transform hover:scale-105"
              >
                View in AR
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p className="mb-2">Supported formats:</p>
              <div className="flex justify-center space-x-2">
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">GLB/GLTF</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">MP4/WebM</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">PNG/JPG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-loaded Assets Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Try Pre-loaded Assets</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PRELOADED_ASSETS.map((asset, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group"
                onClick={() => handlePreloadedAsset(asset.url)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    asset.type === '3D Model' ? 'bg-blue-600 text-blue-100' :
                    asset.type === 'Video' ? 'bg-red-600 text-red-100' :
                    'bg-green-600 text-green-100'
                  }`}>
                    {asset.type}
                  </span>
                  <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                  {asset.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {asset.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">How to Use AR</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-semibold mb-2">1. Choose Asset</h4>
              <p className="text-gray-400 text-sm">Select a pre-loaded asset or paste your own URL</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📷</div>
              <h4 className="font-semibold mb-2">2. Point Camera</h4>
              <p className="text-gray-400 text-sm">Point your device camera at a flat surface</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h4 className="font-semibold mb-2">3. View in AR</h4>
              <p className="text-gray-400 text-sm">Tap "View in AR" to place the asset in your environment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
