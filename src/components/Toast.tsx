// src/components/Toast.tsx
// Reusable slide-up toast notification.
// Usage: <Toast message="…" visible={bool} />
// Visible for 2.5 seconds; parent controls the flag via a timer.

import React from 'react'

interface Props {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: Props) {
  if (!visible) return null
  return (
    <div className="toast-popup" role="status" aria-live="polite">
      {message}
    </div>
  )
}
