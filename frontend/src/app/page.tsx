"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('// Write or paste your code here...')
  const [language, setLanguage] = useState('javascript')
  const [isPublic, setIsPublic] = useState(true)
  const { user, token, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!user || !token) {
      alert('Please sign in first!')
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/snippets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title || 'Untitled Snippet',
          content: code,
          language,
          is_public: isPublic,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create snippet')
      }

      const data = await response.json()
      router.push(`/snippet/${data.id}`)
    } catch (error) {
      console.error(error)
      alert('Failed to save snippet. Check console for details.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Hero Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-black tracking-tight text-white">
          Create a New <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Snippet</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Paste your code, select your syntax, and share with your teammates instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-gray-900 bg-gray-950 p-1 shadow-2xl">
            <Editor
              height="60vh"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
              Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quick Sort Algorithm"
                  className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Language
                </label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-300 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPublic} 
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-950 border-gray-850 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  Make snippet public
                </label>
              </div>
            </div>

            {user ? (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all text-sm shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Saving...' : 'Create Snippet'}
              </button>
            ) : (
              <div className="text-center p-4 bg-gray-950/50 border border-dashed border-gray-800 rounded-xl space-y-2">
                <p className="text-xs text-gray-400">
                  You must be signed in to save snippets.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
