import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Center Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
        
        {/* Hero Images */}
        <div className="relative flex items-center justify-center">
          <img src={heroImg} className="w-40 h-auto" alt="" />
          
          <img
            src={reactLogo}
            alt="React logo"
            className="absolute w-16 animate-spin-slow"
          />

          <img
            src={viteLogo}
            alt="Vite logo"
            className="absolute w-16 translate-x-16"
          />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Get started</h1>
          <p className="text-gray-600">
            Edit <code className="bg-gray-200 px-1 rounded">src/App.jsx</code> and save to test{' '}
            <code className="bg-gray-200 px-1 rounded">HMR</code>
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Count is {count}
        </button>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Next Steps */}
      <section className="grid md:grid-cols-2 gap-10 p-10">

        {/* Docs */}
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-2">Documentation</h2>
          <p className="text-gray-500 mb-4">Your questions, answered</p>

          <ul className="space-y-3">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <img className="w-5" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>

            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <img className="w-5" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-2">Connect with us</h2>
          <p className="text-gray-500 mb-4">Join the Vite community</p>

          <ul className="space-y-3">
            <li>
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://chat.vite.dev/"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://x.com/vite_js"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                X.com
              </a>
            </li>
            <li>
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Bluesky
              </a>
            </li>
          </ul>
        </div>

      </section>

      {/* Bottom Spacer */}
      <div className="border-t border-gray-200"></div>
      <section className="h-20"></section>
    </>
  )
}

export default App