"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'

export default function Home() {
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('// Write or paste your code here...')
  const [language, setLanguage] = useState('javascript')
  const [isPublic, setIsPublic] = useState(true)
  const router = useRouter()

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/snippets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
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
      alert('Failed to save snippet')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          CodeShare
        </h1>
        <p className="text-gray-400">Create and share code snippets instantly.</p>
        
        <div className="flex gap-4">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Snippet Title"
            className="flex-1 bg-gray-900 border border-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-900 border border-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-300"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-800">
          <Editor
            height="50vh"
            language={language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded bg-gray-900 border-gray-800 text-blue-500 focus:ring-blue-500"
            />
            Make snippet public
          </label>

          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Create Snippet
          </button>
        </div>
      </div>
    </div>
  )
}
