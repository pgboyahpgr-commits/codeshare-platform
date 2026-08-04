export interface SnippetFile {
  name: string
  language: string
  content: string
}

export interface Snippet {
  id: string
  title: string
  content: string
  language: string
  is_public: boolean
  created_at: string
  expires_at?: string | null
  view_count: number
  user_id?: string | null
}

export const BUNDLE_MARKER = "__codeshare_bundle__"

const EXTENSION_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  json: "json",
  md: "markdown",
  txt: "plaintext",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  sh: "shell",
  bash: "shell",
  sql: "sql",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  toml: "ini",
  ini: "ini",
  dockerfile: "dockerfile",
  swift: "swift",
  kt: "kotlin",
  dart: "dart",
  r: "r",
  lua: "lua",
  vue: "html",
  svelte: "html",
}

export function detectLanguage(name: string, content: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase()
  if (name.toLowerCase() === "dockerfile") return "dockerfile"
  if (EXTENSION_MAP[ext]) return EXTENSION_MAP[ext]

  const trimmed = content.trimStart()
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return "html"
  if (trimmed.startsWith("{")) return "json"
  if (trimmed.startsWith("def ") || trimmed.includes("import ") && (trimmed.includes("print(") || trimmed.includes(":") && trimmed.split("\n").length > 2)) return "python"
  if (trimmed.startsWith("<?php")) return "php"
  if (trimmed.startsWith("import React") || trimmed.startsWith("export")) return "javascript"
  if (trimmed.startsWith("#")) return "shell"
  if (trimmed.startsWith("const ") || trimmed.startsWith("let ") || trimmed.startsWith("function ")) return "javascript"
  if (trimmed.includes("<style")) return "html"
  if (trimmed.includes("SELECT ") || trimmed.startsWith("CREATE ") || trimmed.startsWith("ALTER ")) return "sql"
  return "plaintext"
}

export function guessPrimaryLanguage(files: SnippetFile[]): string {
  if (files.length === 0) return "plaintext"
  const order = ["html", "javascript", "typescript", "python", "css", "json", "markdown"]
  for (const lang of order) {
    const found = files.find((f) => f.language === lang)
    if (found) return lang
  }
  return files[0].language
}

export function encodeBundle(files: SnippetFile[], content: string): string {
  if (files.length <= 1) return content
  return JSON.stringify({
    __v: BUNDLE_MARKER,
    files,
  })
}

export function decodeSnippet(snippet: Snippet): SnippetFile[] {
  try {
    const parsed = JSON.parse(snippet.content)
    if (parsed && parsed.__v === BUNDLE_MARKER && Array.isArray(parsed.files)) {
      return parsed.files.map((f: SnippetFile) => ({
        name: f.name || "untitled",
        language: f.language || detectLanguage(f.name || "", f.content || ""),
        content: f.content || "",
      }))
    }
  } catch {
    // not a bundle, fall through
  }
  const ext = languageToExtension(snippet.language)
  return [{ name: `snippet.${ext}`, language: snippet.language, content: snippet.content }]
}

export function languageToExtension(language: string): string {
  const map: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    html: "html",
    css: "css",
    json: "json",
    markdown: "md",
    scss: "scss",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    ruby: "rb",
    php: "php",
    shell: "sh",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    ini: "ini",
    swift: "swift",
    kotlin: "kt",
    dart: "dart",
    r: "r",
    lua: "lua",
    plaintext: "txt",
    dockerfile: "Dockerfile",
  }
  return map[language] || "txt"
}

export function languageBadgeColor(language: string): string {
  const map: Record<string, string> = {
    javascript: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    typescript: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    python: "bg-green-500/15 text-green-400 border-green-500/30",
    html: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    css: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    json: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    markdown: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    shell: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    sql: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    java: "bg-red-500/15 text-red-400 border-red-500/30",
    plaintext: "bg-gray-600/15 text-gray-400 border-gray-600/30",
  }
  return map[language] || "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
}

export function buildPreview(files: SnippetFile[]): string {
  const htmlFile = files.find((f) => f.language === "html")
  const cssFiles = files.filter((f) => f.language === "css")
  const jsFiles = files.filter((f) => f.language === "javascript" || f.language === "typescript")

  const css = cssFiles.map((f) => f.content).join("\n")
  const js = jsFiles.map((f) => f.content).join("\n")

  if (htmlFile) {
    let html = htmlFile.content
    if (css && !html.includes("</style>")) {
      html = html.replace("</head>", `\n<style>\n${css}\n</style>\n</head>`)
      if (!html.includes("</head>")) {
        html = `<style>\n${css}\n</style>\n${html}`
      }
    }
    if (js && !html.includes("</script>")) {
      html = html.replace("</body>", `\n<script>\n${js}\n</script>\n</body>`)
      if (!html.includes("</body>")) {
        html = `${html}\n<script>\n${js}\n</script>`
      }
    }
    return html
  }

  const bodyContent = files.filter((f) => f.language !== "css" && f.language !== "javascript" && f.language !== "typescript").map((f) => f.content).join("\n")
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>\n${css}\n</style>
</head>
<body>
${bodyContent}
<script>\n${js}\n</script>
</body>
</html>`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}
