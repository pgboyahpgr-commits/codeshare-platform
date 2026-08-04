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

    fetch(`http://localhost:8000/api/snippets/${id}`)
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
        <div className="text-xl">Loading snippet...</div>
      </div>
    )
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error || 'Snippet not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{snippet.title || 'Untitled Snippet'}</h1>
          <span className="text-sm bg-gray-900 border border-gray-800 px-3 py-1 rounded text-gray-400 font-mono">
            {snippet.language}
          </span>
        </div>
        
        <div className="rounded-lg overflow-hidden border border-gray-800">
          <Editor
            height="70vh"
            language={snippet.language}
            value={snippet.content}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </div>
  )
}
