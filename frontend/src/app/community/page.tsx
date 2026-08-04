"use client"

import { useEffect, useMemo, useState } from "react"
import SnippetCard from "@/components/SnippetCard"
import { guessPrimaryLanguage, decodeSnippet } from "@/lib/snippet"

interface Snippet {
  id: string
  title: string
  content: string
  language: string
  is_public: boolean
  created_at: string
  view_count: number
}

interface EnrichedSnippet extends Snippet {
  _files: import("@/lib/snippet").SnippetFile[]
  _lang: string
}

const LANGUAGES = ["All", "html", "javascript", "typescript", "python", "css", "json", "markdown", "other"]

export default function CommunityPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [query, setQuery] = useState("")

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    fetch(`${apiUrl}/api/snippets/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load snippets")
        return res.json()
      })
      .then((data) => {
        setSnippets(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const enriched = useMemo(() => {
    return snippets.map((s): EnrichedSnippet => {
      const files = decodeSnippet(s)
      return { ...s, _files: files, _lang: guessPrimaryLanguage(files) }
    })
  }, [snippets])

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      const langOk = filter === "All" || (filter === "other" ? !LANGUAGES.slice(1, -1).includes(s._lang) : s._lang === filter)
      const q = query.trim().toLowerCase()
      const queryOk = !q || s.title.toLowerCase().includes(q) || s._files.some((f) => f.content.toLowerCase().includes(q))
      return langOk && queryOk
    })
  }, [enriched, filter, query])

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-white">
          Community <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Snippets</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Explore public snippets shared by developers around the world.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filter === lang
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white"
              }`}
            >
              {lang === "All" ? "All" : lang}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search snippets..."
          className="w-full md:w-72 bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-4 text-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-400 font-medium">Loading community snippets...</div>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-400 text-lg">No snippets found{filter !== "All" || query ? " matching your filters" : " yet"}. Be the first to share one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <SnippetCard key={s.id} snippet={s} />
          ))}
        </div>
      )}
    </main>
  )
}