"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import { useAuth } from "@/context/AuthContext"
import LivePreview from "@/components/LivePreview"
import {
  detectLanguage,
  encodeBundle,
  guessPrimaryLanguage,
  languageBadgeColor,
  type SnippetFile,
} from "@/lib/snippet"

const LANGUAGE_OPTIONS = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "scss",
  "json",
  "markdown",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "shell",
  "sql",
  "xml",
  "yaml",
  "plaintext",
]

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `f-${idCounter}-${Date.now()}`
}

function makeFile(name: string, content = "", language?: string): SnippetFile & { id: string } {
  return { id: nextId(), name, content, language: language || detectLanguage(name, content) }
}

const DEFAULT_FILES = () => [
  makeFile(
    "index.html",
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Preview</title>
</head>
<body>
  <h1>Hello, CodeShare!</h1>
  <button onclick="greet()">Click me</button>
</body>
</html>`
  ),
  makeFile("style.css", "body {\n  font-family: sans-serif;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  background: #0f172a;\n  color: #e2e8f0;\n}\n\nh1 {\n  color: #818cf8;\n}\n\nbutton {\n  padding: 10px 18px;\n  border: none;\n  border-radius: 8px;\n  background: #6366f1;\n  color: white;\n  cursor: pointer;\n}\n"),
  makeFile("script.js", "function greet() {\n  alert('Hello from CodeShare!');\n}\n"),
]

function defaultNameForLanguage(lang: string, existing: string[]): string {
  const map: Record<string, string> = {
    html: "index.html",
    css: "style.css",
    scss: "style.scss",
    javascript: "script.js",
    typescript: "script.ts",
    python: "main.py",
    markdown: "README.md",
    json: "data.json",
  }
  const base = map[lang] || `file.${lang}`
  if (!existing.includes(base)) return base
  const ext = base.split(".").pop()
  let n = 2
  while (existing.includes(`file-${n}.${ext}`)) n++
  return `file-${n}.${ext}`
}

export default function Home() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [files, setFiles] = useState<(SnippetFile & { id: string })[]>(DEFAULT_FILES)
  const [activeId, setActiveId] = useState(files[0].id)
  const [isPublic, setIsPublic] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeFile = files.find((f) => f.id === activeId) || files[0]
  const primaryLang = guessPrimaryLanguage(files)

  const updateActive = (patch: Partial<SnippetFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === activeId ? { ...f, ...patch } : f)))
  }

  const addFile = (name?: string, content = "", language?: string) => {
    const file = makeFile(
      name || defaultNameForLanguage(language || activeFile.language, files.map((f) => f.name)),
      content,
      language
    )
    setFiles((prev) => [...prev, file])
    setActiveId(file.id)
  }

  const closeFile = (id: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev
      const idx = prev.findIndex((f) => f.id === id)
      const next = prev.filter((f) => f.id !== id)
      if (activeId === id) setActiveId(next[Math.min(idx, next.length - 1)].id)
      return next
    })
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    const added: (SnippetFile & { id: string })[] = []
    Array.from(selected).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const content = String(reader.result || "")
        added.push(makeFile(file.name, content))
        if (added.length === Array.from(selected).length) {
          setFiles((prev) => [...prev, ...added])
          setActiveId(added[0].id)
        }
      }
      reader.readAsText(file)
    })
    e.target.value = ""
  }

  const saveSingleFile = async (encodedContent: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/api/snippets/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title || "Untitled Snippet",
        content: encodedContent,
        language: primaryLang,
        is_public: isPublic,
      }),
    })
    if (!response.ok) throw new Error("Failed to create snippet")
    return response.json()
  }

  const handleSave = async () => {
    if (!user || !token) {
      setSaveMsg("Please sign in first!")
      return
    }
    setLoading(true)
    setSaveMsg("")
    try {
      const encoded = encodeBundle(files, files[0].content)
      const data = await saveSingleFile(encoded)
      router.push(`/snippet/${data.id}`)
    } catch (error) {
      console.error(error)
      setSaveMsg("Failed to save snippet. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Create a <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Snippet</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Write code, upload files, and preview HTML/CSS/JS live.
          </p>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Snippet title (optional)"
          className="w-full md:w-72 bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Editor area */}
        <div className={`${showPreview ? "lg:col-span-3" : "lg:col-span-5"} space-y-3`}>
          {/* File tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-t-2xl border border-gray-800 bg-gray-900/70 p-1.5">
            {files.map((f) => (
              <div
                key={f.id}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  f.id === activeId
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setActiveId(f.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                </svg>
                {f.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeFile(f.id)
                  }}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Close file"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addFile()}
              className="shrink-0 ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              + New File
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              ⬆ Upload
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          </div>

          {/* Active file controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                value={activeFile.name}
                onChange={(e) => updateActive({ name: e.target.value })}
                disabled={files.length === 1}
                className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm font-mono disabled:opacity-60"
              />
              <select
                value={activeFile.language}
                onChange={(e) => updateActive({ language: e.target.value })}
                className="bg-gray-900 border border-gray-800 px-2 py-1.5 rounded-lg focus:ring-blue-500 outline-none text-gray-300 text-xs"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${languageBadgeColor(activeFile.language)}`}>
              {activeFile.language}
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-900 bg-gray-950 p-1 shadow-2xl">
            <Editor
              height="62vh"
              language={activeFile.language}
              value={activeFile.content}
              onChange={(val) => updateActive({ content: val || "" })}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
                lineNumbers: "on",
                tabSize: 2,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
              onMount={(editor, monaco) => {
                if (monaco) {
                  monaco.editor.setModelLanguage(editor.getModel()!, activeFile.language)
                }
              }}
            />
          </div>

          {/* Preview toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                showPreview
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <span className="text-xs text-gray-500">
              {primaryLang === "html"
                ? "Live preview available for HTML/CSS/JS projects"
                : `Primary language: ${primaryLang}`}
            </span>
          </div>
        </div>

        {/* Right: preview + settings */}
        <div className={`${showPreview ? "lg:col-span-2" : "hidden"} space-y-4`}>
          {showPreview && primaryLang === "html" && (
            <LivePreview files={files} className="rounded-2xl border border-gray-800 bg-gray-950 h-[62vh] overflow-hidden shadow-2xl" />
          )}
          {showPreview && primaryLang !== "html" && (
            <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/40 h-[62vh] flex items-center justify-center p-8 text-center">
              <p className="text-gray-400 text-sm">
                Live preview is available for <span className="text-blue-400 font-semibold">HTML/CSS/JS</span> projects.
                Add an <span className="font-mono text-gray-200">index.html</span> file to enable it.
              </p>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2.5">Settings</h3>
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              Make snippet public
            </label>

            {user ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-all text-sm shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Saving..." : "Create Snippet"}
                </button>
                {saveMsg && <p className={`text-xs text-center ${saveMsg === "Please sign in first!" ? "text-amber-400" : "text-red-400"}`}>{saveMsg}</p>}
              </>
            ) : (
              <div className="text-center p-4 bg-gray-950/50 border border-dashed border-gray-800 rounded-xl space-y-2">
                <p className="text-xs text-gray-400">You must be signed in to save snippets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}