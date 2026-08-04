"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "./AuthModal"
import Link from "next/link"

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 bg-gray-950/75 backdrop-blur-md border-b border-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              CodeShare
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
            >
              New Snippet
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 font-mono hidden md:inline">
                  @{user.username}
                </span>
                <button
                  onClick={signOut}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}

