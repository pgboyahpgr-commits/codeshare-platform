"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load session from localStorage on mount
    const storedUser = localStorage.getItem("codeshare_user")
    const storedToken = localStorage.getItem("codeshare_token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const login = async (username: string, password: string) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Invalid username or password")
    }

    const data = await res.json()
    localStorage.setItem("codeshare_user", JSON.stringify(data.user))
    localStorage.setItem("codeshare_token", data.access_token)
    setUser(data.user)
    setToken(data.access_token)
  }

  const register = async (username: string, password: string) => {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Error during registration")
    }

    const data = await res.json()
    localStorage.setItem("codeshare_user", JSON.stringify(data.user))
    localStorage.setItem("codeshare_token", data.access_token)
    setUser(data.user)
    setToken(data.access_token)
  }

  const signOut = () => {
    localStorage.removeItem("codeshare_user")
    localStorage.removeItem("codeshare_token")
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
