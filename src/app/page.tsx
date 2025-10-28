'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AR Asset Loader
          </h1>
          <p className="text-gray-300">
            Paste a URL to your 3D model, video, or image to experience it in Augmented Reality
          </p>
        </div>

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
            Load in AR
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p className="mb-2">Supported formats:</p>
          <div className="flex justify-center space-x-4">
            <span className="bg-gray-800 px-2 py-1 rounded">GLB/GLTF</span>
            <span className="bg-gray-800 px-2 py-1 rounded">MP4/WebM</span>
            <span className="bg-gray-800 px-2 py-1 rounded">PNG/JPG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
