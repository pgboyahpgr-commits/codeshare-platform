"use client"

import { buildPreview, type SnippetFile } from "@/lib/snippet"
import { useMemo, useState } from "react"

interface LivePreviewProps {
  files: SnippetFile[]
  className?: string
}

export default function LivePreview({ files, className }: LivePreviewProps) {
  const [key, setKey] = useState(0)
  const [refreshLabel, setRefreshLabel] = useState("")

  const srcDoc = useMemo(() => buildPreview(files), [files])

  const handleRefresh = () => {
    setKey((k) => k + 1)
    setRefreshLabel("Preview refreshed")
    setTimeout(() => setRefreshLabel(""), 2000)
  }

  return (
    <div className={`flex flex-col ${className || ""}`}>
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/60 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-medium text-gray-400">Live Preview</span>
        </div>
        <div className="flex items-center gap-3">
          {refreshLabel && <span className="text-xs text-green-400">{refreshLabel}</span>}
          <button
            onClick={handleRefresh}
            className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      <iframe
        key={key}
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
        srcDoc={srcDoc}
        className="flex-1 w-full bg-white"
      />
    </div>
  )
}