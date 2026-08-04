"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Editor from "@monaco-editor/react"
import LivePreview from "@/components/LivePreview"
import ShareModal from "@/components/ShareModal"
import {
  formatDate,
  guessPrimaryLanguage,
  languageBadgeColor,
  decodeSnippet,
  type Snippet as SnippetType,
  type SnippetFile,
} from "@/lib/snippet"

export default function SnippetPage() {
  const { id } = useParams()
  const [snippet, setSnippet] = useState<SnippetType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeId, setActiveId] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState("")

  useEffect(() => {
    if (!id) return
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    fetch(`${apiUrl}/api/snippets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Snippet not found")
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

  const files: SnippetFile[] = useMemo(() => (snippet ? decodeSnippet(snippet) : []), [snippet])
  const primaryLang = guessPrimaryLanguage(files)
  const activeFile = files[Math.min(activeId, files.length - 1)]
  const hasHtml = primaryLang === "html"

  const copyText = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(""), 2000)
    } catch {
      setCopied("")
    }
  }

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

  if (error || !snippet || !activeFile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Oops! Snippet Not Found</h2>
          <p className="text-gray-400 text-sm">{error || "This snippet does not exist or has expired."}</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            Create New Snippet
          </Link>
        </div>
      </div>
    )
  }

  const snippetUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{snippet.title}</h1>
          <p className="text-sm text-gray-500 font-mono">
            {snippet.id} • Created: {formatDate(snippet.created_at)}
            {snippet.expires_at ? ` • Expires: ${formatDate(snippet.expires_at)}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-3 py-2 rounded-xl border ${languageBadgeColor(primaryLang)}`}>
            {primaryLang}
          </span>
          {hasHtml && (
            <button
              onClick={() => setShowPreview((v) => !v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                showPreview ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              {showPreview ? "Hide Live Preview" : "▶ Live Preview"}
            </button>
          )}
          <button
            onClick={() => setShowShare(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-800 bg-gray-900 text-gray-200 hover:border-gray-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 14.3a5 5 0 0 1 0-7.1l2.4-2.4a5 5 0 0 1 7.1 7.1l-1 1M15.3 9.7a5 5 0 0 1 0 7.1l-2.4 2.4a5 5 0 0 1-7.1-7.1l1-1" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* File tabs */}
      {files.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/70 p-1.5">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveId(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                i === activeId ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Body: preview + code */}
      {hasHtml && showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FileToolbar file={activeFile} copied={copied} copyText={copyText} />
            <CodeView file={activeFile} />
          </div>
          <LivePreview files={files} className="rounded-2xl border border-gray-800 bg-gray-950 h-[72vh] overflow-hidden shadow-2xl" />
        </div>
      ) : (
        <div className="space-y-2">
          <FileToolbar file={activeFile} copied={copied} copyText={copyText} />
          <CodeView file={activeFile} />
        </div>
      )}

      {showShare && (
        <ShareModal
          title={snippet.title}
          snippetUrl={snippetUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </main>
  )
}

function FileToolbar({
  file,
  copied,
  copyText,
}: {
  file: SnippetFile
  copied: string
  copyText: (text: string, what: string) => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-2xl border border-gray-800 bg-gray-900/60">
      <span className="text-xs font-mono text-gray-300">{file.name}</span>
      <button
        onClick={() => copyText(file.content, "code")}
        className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded transition-colors"
      >
        {copied === "code" ? "✓ Copied!" : "Copy Code"}
      </button>
    </div>
  )
}

function CodeView({ file }: { file: SnippetFile }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-900 bg-gray-950 p-1 shadow-2xl">
      <Editor
        height="70vh"
        language={file.language}
        value={file.content}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  )
}