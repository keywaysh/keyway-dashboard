'use client'

import { useEffect } from 'react'
import { Crisp } from 'crisp-sdk-web'

let crispInitialized = false

export function CrispProvider() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!crispInitialized && typeof window !== 'undefined' && websiteId) {
      Crisp.configure(websiteId)
      crispInitialized = true
    }
  }, [])

  return null
}

/**
 * Open Crisp chat for feedback (tagged for filtering in Crisp dashboard)
 */
export function openFeedback() {
  if (typeof window !== 'undefined') {
    Crisp.session.setSegments(['feedback'], false)
    Crisp.chat.open()
  }
}
