"use client"

import { useMemo, useState } from "react"
import { SHARE_TARGETS, buildShareMessage, copyToClipboard, nativeShare } from "@/lib/share"

interface ShareModalProps {
  title: string
  snippetUrl: string
  onClose: () => void
}

function ShareIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    whatsapp: (
      <>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1-.2-.1-.9-.4-1.8-1.1-.7-.6-1.1-1.3-1.3-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" />
      </>
    ),
    twitter: (
      <>
        <path d="M18.2 3h3.3l-7.2 8.3L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.9L1.5 3H8.3l4.7 6.2L18.2 3Zm-1.2 16.2h1.8L7.6 4.7H5.7l11.3 14.5Z" />
      </>
    ),
    facebook: (
      <>
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
      </>
    ),
    telegram: (
      <>
        <path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.4-4.7L18.3 7c.4-.3-.1-.5-.6-.2L7 12.7 2.4 11.3c-1-.3-1-1 .2-1.5L20.5 3c.8-.3 1.5.2 1.4 1.6Z" />
      </>
    ),
    reddit: (
      <>
        <path d="M22 11.9a2.4 2.4 0 0 0-4.1-1.7A9 9 0 0 0 13 9.5V6.9l3.1.7a1.7 1.7 0 1 0 .2-1.1l-3.6-.8a.6.6 0 0 0-.7.4L11.5 9a9 9 0 0 0-5 3.1A2.4 2.4 0 0 0 7 14.4a3.5 3.5 0 0 0 5 3.2 3.5 3.5 0 0 0 5-3.2c0-.5-.1-.9-.4-1.3a2.4 2.4 0 0 0 .6-1.2ZM8.5 12a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm6.9 4a2.5 2.5 0 0 1-2.4 0 .6.6 0 0 1 .6-1 .6.6 0 0 1 1.8 1.1v-.1Zm-.6-2.8a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
      </>
    ),
    linkedin: (
      <>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z" />
      </>
    ),
    email: (
      <>
        <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2 0v.5l8 5 8-5V6H4Zm0 2.2V18h16V8.2l-8 5-8-5Z" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 1.4 1.4 1.7-1.7a3 3 0 1 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0l-1.4-1.4-1.4 1.4 1.4 1.4Zm4 1.4 1.4-1.4-1.4-1.4-1.4 1.4 1.4 1.4ZM8.6 15l3-3a5 5 0 0 0-7.4-.6l-3 3a5 5 0 0 0 7.1 7.1l1.6-1.7-1.4-1.4-1.7 1.7a3 3 0 1 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0l1.4 1.4 1.4-1.4-1.4-1.4h.6l-1.6-1.6h.6-1.4-3.5.6L9.3 12l-.7.6L8.6 15Z" />
      </>
    ),
  }
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      {paths[name] || paths.link}
    </svg>
  )
}

export default function ShareModal({ title, snippetUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareText = useMemo(() => buildShareMessage(title, snippetUrl), [title, snippetUrl])
  const message = shareText

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(snippetUrl)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMessage = async () => {
    const ok = await copyToClipboard(message)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    const used = await nativeShare(snippetUrl, shareText)
    if (used) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 14.3a5 5 0 0 1 0-7.1l2.4-2.4a5 5 0 0 1 7.1 7.1l-1 1M15.3 9.7a5 5 0 0 1 0 7.1l-2.4 2.4a5 5 0 0 1-7.1-7.1l1-1" />
          </svg>
          Share Snippet
        </h2>

        {/* Andon message preview */}
        <div className="mt-4 bg-gray-950/70 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1.5">Sharing message</p>
          <p className="text-sm text-gray-200 break-words">{message}</p>
        </div>

        {/* Copy actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyMessage}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <ShareIcon name="link" />
            {copied ? "✓ Copied!" : "Copy + Message"}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7l1.1-1.1M10.2 13.8a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-1.1 1.1" />
            </svg>
            {copied ? "✓ Link Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Native share */}
        <button
          onClick={handleNativeShare}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 8 5 8a3.5 3.5 0 0 0 0 7h2m10-7h2a3.5 3.5 0 0 1 0 7h-2M9 5l3 3m0 0 3-3M12 8v10" />
          </svg>
          Share via native share
        </button>

        {/* Divider */}
        <div className="mt-5 mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-800" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">Or share to</span>
          <div className="h-px flex-1 bg-gray-800" />
        </div>

        {/* Social grid */}
        <div className="grid grid-cols-4 gap-2">
          {SHARE_TARGETS.map((target) => (
            <a
              key={target.id}
              href={target.buildUrl(snippetUrl, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-950/50 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/60 transition-all group"
            >
              <span style={{ color: target.color }}>
                <ShareIcon name={target.icon} />
              </span>
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors">
                {target.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}