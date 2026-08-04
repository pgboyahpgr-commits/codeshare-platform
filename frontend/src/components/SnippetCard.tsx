"use client"

import { useState } from "react"
import { formatDate, guessPrimaryLanguage, languageBadgeColor, type Snippet, type SnippetFile } from "@/lib/snippet"
import Link from "next/link"
import ShareModal from "./ShareModal"

interface SnippetCardProps {
  snippet: Snippet
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const [showShare, setShowShare] = useState(false)
  const files: SnippetFile[] = snippet.content && snippet.content.length > 0 && snippet.content[0] === "{" ? tryParse(snippet) : [{ name: "snippet", language: snippet.language, content: snippet.content }]
  const primaryLang = guessPrimaryLanguage(files)
  const preview = files[0]?.content || ""

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col">
      <Link href={`/snippet/${snippet.id}`} className="flex-1 flex flex-col">
        <div className="p-5 space-y-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
              {snippet.title || "Untitled Snippet"}
            </h3>
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border ${languageBadgeColor(primaryLang)}`}>
              {primaryLang}
            </span>
          </div>
          <pre className="text-xs text-gray-400 font-mono line-clamp-4 whitespace-pre-wrap bg-gray-950/60 rounded-xl p-3 border border-gray-800/70 max-h-28 overflow-hidden">
            {preview}
          </pre>
        </div>
      </Link>
      <div className="px-5 py-3 border-t border-gray-800 bg-gray-950/40 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(snippet.created_at)}</span>
        <span className="flex items-center gap-3">
          {files.length > 1 && (
            <span className="flex items-center gap-1 text-indigo-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              {files.length}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {snippet.view_count ?? 0}
          </span>
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            title="Share snippet"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 14.3a5 5 0 0 1 0-7.1l2.4-2.4a5 5 0 0 1 7.1 7.1l-1 1M15.3 9.7a5 5 0 0 1 0 7.1l-2.4 2.4a5 5 0 0 1-7.1-7.1l1-1" />
            </svg>
            Share
          </button>
        </span>
      </div>
      {showShare && (
        <ShareModal
          title={snippet.title || "a snippet"}
          snippetUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/snippet/${snippet.id}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

function tryParse(snippet: Snippet): SnippetFile[] {
  try {
    const parsed = JSON.parse(snippet.content)
    if (parsed && parsed.__v === "__codeshare_bundle__" && Array.isArray(parsed.files)) {
      return parsed.files.map((f: SnippetFile) => ({
        name: f.name || "untitled",
        language: f.language || "text",
        content: f.content || "",
      }))
    }
    return [{ name: "snippet", language: snippet.language, content: snippet.content }]
  } catch {
    return [{ name: "snippet", language: snippet.language, content: snippet.content }]
  }
}