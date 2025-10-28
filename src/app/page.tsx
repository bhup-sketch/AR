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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">AR Experience</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#gallery" className="text-gray-500 hover:text-gray-900 transition-colors">Gallery</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900 transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Experience Reality
                <span className="block text-indigo-600">Augmented</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform your world with interactive 3D models, videos, and images.
                Choose from our curated collection or upload your own content.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => document.getElementById('custom-url')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload Custom Asset
                </button>
                <button
                  onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Gallery
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful AR Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform supports multiple content types and provides seamless AR experiences across devices.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3D Models</h3>
                <p className="text-gray-600">Interactive GLB/GLTF models with realistic lighting and shadows</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Content</h3>
                <p className="text-gray-600">Seamless video playback with audio support in AR environments</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Assets</h3>
                <p className="text-gray-600">High-quality image display with AR placement capabilities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Custom URL Section */}
        <section id="custom-url" className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Custom Content</h2>
              <p className="text-gray-600">Have your own 3D models, videos, or images? Upload them here for an instant AR experience.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="asset-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Asset URL
                  </label>
                  <input
                    id="asset-url"
                    type="url"
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    placeholder="https://example.com/your-asset.glb"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Experience in AR
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center mb-3">Supported formats:</p>
                <div className="flex justify-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GLB/GLTF</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">MP4/WebM</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">PNG/JPG</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured AR Experiences</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our curated collection of AR-ready assets. Click any item to experience it in augmented reality.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PRELOADED_ASSETS.map((asset, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => handlePreloadedAsset(asset.url)}
                >
                  <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          asset.type === '3D Model' ? 'bg-blue-500' :
                          asset.type === 'Video' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}>
                          {asset.type === '3D Model' ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          ) : asset.type === 'Video' ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 14H13m3-7v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1m10 0v10a2 2 0 01-2 2h1" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{asset.type}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {asset.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {asset.description}
                      </p>
                      <div className="flex items-center text-indigo-600 font-medium text-sm">
                        <span>Experience in AR</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get started with AR in three simple steps. No app downloads required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Content</h3>
                <p className="text-gray-600">Select from our gallery or upload your own 3D models, videos, or images</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Open on Mobile</h3>
                <p className="text-gray-600">Use your smartphone or tablet for the best AR experience</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">View in AR</h3>
                <p className="text-gray-600">Point your camera at a surface and tap "View in AR" to place content</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">AR Experience</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Bringing augmented reality to everyone. Experience the future of interactive content.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
