"use client"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'

interface Snippet {
  id: string
  title: string
  content: string
  language: string
  view_count: number
  created_at: string
}

export default function SnippetPage() {
  const { id } = useParams()
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/snippets/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Snippet not found')
        }
        return res.json()
      })
      .then((data) => {
        setSnippet(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-400 font-medium">Loading snippet details...</div>
        </div>
      </div>
    )
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Oops! Snippet Not Found</h2>
          <p className="text-gray-400 text-sm">
            {error || 'This snippet does not exist or has expired.'}
          </p>
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Create New Snippet
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Snippet Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {snippet.title}
          </h1>
          <p className="text-sm text-gray-500 font-mono">
            ID: {snippet.id} • Created: {new Date(snippet.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-gray-900 border border-gray-800 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase">
            {snippet.language}
          </span>
        </div>
      </div>

      {/* Editor Container */}
      <div className="rounded-2xl overflow-hidden border border-gray-900 bg-gray-950 p-1 shadow-2xl">
        <Editor
          height="70vh"
          language={snippet.language}
          value={snippet.content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </main>
  )
}
