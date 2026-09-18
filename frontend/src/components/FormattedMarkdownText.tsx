'use client'

import React from 'react'

interface FormattedMarkdownTextProps {
  text: string
  className?: string
  boldClassName?: string
  italicClassName?: string
}

/**
 * FormattedMarkdownText
 * Parses markdown inline styles (**bold**, *italic/bold*, _italic_, bullets)
 * into rich JSX elements without exposing raw '*' or '**' characters.
 */
export default function FormattedMarkdownText({
  text,
  className = '',
  boldClassName = 'font-semibold text-emerald-300',
  italicClassName = 'font-medium text-amber-200/90',
}: FormattedMarkdownTextProps) {
  if (!text) return null

  // Strip out any redundant title lines such as '🌾 **உழவன் சகாயக் (...)**:' or '🌾 **உழவன் சேவை...**:'
  const rawLines = text.split('\n')
  const lines = rawLines.filter((line) => {
    const trimmed = line.trim()
    if (!trimmed) return true
    // Strip titles matching உழவன் சகாயக் / உழவன் சேவை / Uzhavan
    if (/^(?:🌾\s*)?\*{1,2}(?:உழவன்|Uzhavan|Agri-Sovereign)[^*]+\*{1,2}:?$/i.test(trimmed)) {
      return false
    }
    if (/^(?:🌾\s*)?(?:உழவன் சகாயக்|உழவன் சேவை)[^:]*:\s*$/i.test(trimmed)) {
      return false
    }
    return true
  })

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1" />
        }

        let cleanLine = line
        let isBullet = false

        // Normalize leading bullet indicators (*, -, •)
        if (/^(\s*[-•*]\s+)/.test(cleanLine)) {
          isBullet = true
          cleanLine = cleanLine.replace(/^(\s*[-•*]\s+)/, '')
        }

        // Parse inline bold (**...**), bold/italic (*...*), __...__, _..._
        const parts: React.ReactNode[] = []
        let lastIndex = 0
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_)/g
        let match

        while ((match = regex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanLine.substring(lastIndex, match.index))
          }

          if (match[2]) {
            // **bold**
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className={boldClassName}>
                {match[2]}
              </strong>
            )
          } else if (match[3]) {
            // *italic or single-asterisk bold/emphasis*
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className={italicClassName}>
                {match[3]}
              </strong>
            )
          } else if (match[4]) {
            // __bold__
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className={boldClassName}>
                {match[4]}
              </strong>
            )
          } else if (match[5]) {
            // _italic_
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className="italic text-gray-200">
                {match[5]}
              </em>
            )
          }

          lastIndex = match.index + match[0].length
        }

        if (lastIndex < cleanLine.length) {
          parts.push(cleanLine.substring(lastIndex))
        }

        // Check for severe banned chemical / toxic warning (Strictly reserved for Red)
        const isBannedOrSevereWarning =
          /🚫|தடை செய்யப்பட்ட|தடை விதிக்கப்பட்டுள்ளது|நச்சுத்தன்மை|பயன்படுத்தக் கூடாது|toxic/i.test(line)

        if (isBannedOrSevereWarning) {
          return (
            <div
              key={lineIdx}
              className="my-3 rounded-[10px] text-sm leading-relaxed border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3.5 text-[var(--text-primary)]"
            >
              {parts.length > 0 ? parts : cleanLine}
            </div>
          )
        }

        // Check for important notifications / advisories / PHI / statutory notices (Warm harvest amber, NOT Red)
        const isImportantNotification =
          /🛡️|⚠️|cibrc|பரிந்துரைக்கப்படும் மருந்து அளவு|காத்திருப்பு காலம்|phi:/i.test(line)

        if (isImportantNotification) {
          return (
            <div
              key={lineIdx}
              className="my-3 rounded-[10px] text-sm leading-relaxed border border-[var(--notice-border)] bg-[var(--notice-bg)] p-3.5 text-[var(--text-primary)]"
            >
              {parts.length > 0 ? parts : cleanLine}
            </div>
          )
        }

        // Check for crop / district header or recommended management box
        const isLocationHeader = /📍\s*\*\*(?:பயிர்|மாவட்டம்)/i.test(line)

        if (isLocationHeader) {
          return (
            <div
              key={lineIdx}
              className="my-2.5 rounded-[10px] text-xs md:text-sm font-medium border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-3 text-[var(--text-primary)]"
            >
              {parts.length > 0 ? parts : cleanLine}
            </div>
          )
        }

        return (
          <p
            key={lineIdx}
            className={`leading-relaxed ${
              isBullet ? 'pl-3.5 relative before:content-["•"] before:absolute before:left-0 before:text-[var(--primary-accent)]' : ''
            }`}
          >
            {parts.length > 0 ? parts : cleanLine}
          </p>
        )
      })}
    </div>
  )
}
