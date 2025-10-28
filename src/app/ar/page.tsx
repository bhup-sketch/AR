'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ARViewer from '../components/ARViewer';
import MediaARViewer from '../components/MediaARViewer';

type AssetType = 'model' | 'video' | 'image' | 'unknown';

function ARExperienceContent() {
  const searchParams = useSearchParams();
  const assetUrl = searchParams.get('url');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('unknown');

  const getAssetType = (url: string): AssetType => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['glb', 'gltf'].includes(extension || '')) return 'model';
    if (['mp4', 'webm', 'mov'].includes(extension || '')) return 'video';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  useEffect(() => {
    if (!assetUrl) {
      setError('No asset URL provided');
      setIsLoading(false);
      return;
    }

    // Basic validation
    try {
      new URL(assetUrl);
      const type = getAssetType(assetUrl);
      setAssetType(type);
      setIsLoading(false);
    } catch {
      setError('Invalid asset URL');
      setIsLoading(false);
    }
  }, [assetUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading AR experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-4 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Asset</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Try Another URL
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AR Experience
          </h1>
          <p className="text-gray-300 mb-4">
            Experience your asset in Augmented Reality
          </p>
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-yellow-200 text-sm">
              <strong>AR Instructions:</strong> Point your camera at a flat surface and tap "View in AR" to place the asset in your environment.
            </p>
          </div>
        </div>

        {/* AR Viewer */}
        <div className="w-full max-w-4xl mx-auto" style={{ height: '600px' }}>
          {assetType === 'model' ? (
            <ARViewer
              assetUrl={assetUrl!}
              alt="Custom AR Asset"
              autoActivateAR={true}
            />
          ) : (assetType === 'video' || assetType === 'image') ? (
            <MediaARViewer
              assetUrl={assetUrl!}
              assetType={assetType}
              alt="Custom AR Media"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">⚠️</div>
                <p>Unsupported asset type</p>
                <p className="text-sm text-gray-400 mt-2">Please use GLB/GLTF, MP4/WebM, or PNG/JPG files</p>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ← Load Different Asset
          </a>
        </div>
      </main>
    </div>
  );
}

export default function ARExperience() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading AR experience...</p>
        </div>
      </div>
    }>
      <ARExperienceContent />
    </Suspense>
  );
}