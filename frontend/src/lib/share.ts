export interface ShareTarget {
  id: string
  label: string
  color: string
  icon: string
  buildUrl: (url: string, text: string) => string
}

export function buildShareMessage(title: string, snippetUrl: string): string {
  const cleanTitle = title && title.trim() !== "" ? title.trim() : "an awesome snippet"
  return `Check out ${cleanTitle} on CodeShare! 🚀 ${snippetUrl}`
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: "whatsapp",
    buildUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: "twitter",
    label: "Twitter / X",
    color: "#1DA1F2",
    icon: "twitter",
    buildUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: "facebook",
    buildUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#0088CC",
    icon: "telegram",
    buildUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "#FF4500",
    icon: "reddit",
    buildUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: "linkedin",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    buildUrl: (url, _text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "email",
    label: "Email",
    color: "#EA4335",
    icon: "email",
    buildUrl: (url, text) => `mailto:?subject=${encodeURIComponent("Shared code from CodeShare")}&body=${encodeURIComponent(text + "\n\n" + url)}`,
  },
]

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

export async function nativeShare(url: string, text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "CodeShare", text, url })
      return true
    } catch {
      return false
    }
  }
  return false
}
