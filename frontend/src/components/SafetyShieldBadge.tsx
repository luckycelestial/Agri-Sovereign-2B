'use client'

import React, { useState } from 'react'
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface SafetyResult {
  status: string
  banned_chemicals_found?: string[]
  dosage_flags?: string[]
  phi_warnings?: string[]
  verdict_tamil?: string
  statutory_basis?: string
  summary?: string
  verdict?: string
}

interface SafetyShieldBadgeProps {
  safety?: SafetyResult
}

export default function SafetyShieldBadge({ safety }: SafetyShieldBadgeProps) {
  const [expanded, setExpanded] = useState(false)
  if (!safety) return null

  const status = safety.status || safety.verdict || 'PASS'
  const isPass = status === 'PASS'
  const isFail = status === 'FAIL'
  const hasDetails = (safety.banned_chemicals_found && safety.banned_chemicals_found.length > 0) ||
                     (safety.dosage_flags && safety.dosage_flags.length > 0)

  return (
    <div className="space-y-1.5">
      <div
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
          hasDetails ? 'cursor-pointer hover:opacity-90' : ''
        } ${
          isPass
            ? 'bg-[var(--highlight-bg)] border border-[var(--success)]/60 text-[var(--success)]'
            : isFail
            ? 'bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--warning-alert)]'
            : 'bg-[var(--notice-bg)] border border-[var(--notice-border)] text-[var(--notice)]'
        }`}
      >
        {isPass ? (
          <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0" />
        ) : isFail ? (
          <XCircle className="w-4 h-4 text-[var(--warning-alert)] shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[var(--notice)] shrink-0" />
        )}

        <span>
          CIBRC {status}: {safety.verdict_tamil || (isPass ? 'பாதுகாப்பான பரிந்துரை' : isFail ? 'தடைசெய்யப்பட்ட எச்சரிக்கை' : 'கவனத்திற்குரிய குறிப்பு')}
        </span>

        {hasDetails && (
          <span className="text-[var(--text-secondary)] ml-1">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        )}
      </div>

      {expanded && hasDetails && (
        <div className="p-3.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-1.5 animate-message">
          {safety.banned_chemicals_found && safety.banned_chemicals_found.length > 0 && (
            <div className="text-[var(--warning-alert)] font-medium">
              <span className="font-bold">தடைசெய்யப்பட்ட பூச்சிக்கொல்லி:</span> {safety.banned_chemicals_found.join(', ')}
            </div>
          )}
          {safety.dosage_flags && safety.dosage_flags.length > 0 && (
            <div className="text-[var(--notice)] font-medium">
              <span className="font-bold">அளவீட்டுக் குறிப்பு (Dosage Notice):</span> {safety.dosage_flags.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
