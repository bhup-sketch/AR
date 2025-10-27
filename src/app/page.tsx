import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Experience Reality, Augmented
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover the future of interactive experiences through augmented reality
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">
            Get Started
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4">Interactive Design</h3>
            <p className="text-gray-300">Create immersive AR experiences that captivate and engage users.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4">Real-time Tracking</h3>
            <p className="text-gray-300">Advanced tracking technology for seamless AR integration.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4">Cross-platform</h3>
            <p className="text-gray-300">Deploy your AR applications across multiple platforms effortlessly.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-900 to-blue-900 p-12 rounded-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Reality?</h2>
          <p className="text-xl text-gray-300 mb-8">Join us in shaping the future of augmented reality</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-purple-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 AR Experience. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
