'use client'

import { useState, useEffect } from 'react'

interface IOSPWAState {
  isIOS: boolean
  isInStandaloneMode: boolean
  isSafari: boolean
  canInstall: boolean
}

export function useIOSPWA() {
  const [iosState, setIOSState] = useState<IOSPWAState>({
    isIOS: false,
    isInStandaloneMode: false,
    isSafari: false,
    canInstall: false,
  })

  useEffect(() => {
    // iOS 기기 감지 (더 정확한 방법)
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /ipad|iphone|ipod/.test(userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    // Safari 브라우저 감지
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/crios/.test(userAgent)

    // Standalone 모드 감지 (홈 화면에서 실행 중)
    const isInStandaloneMode = (window.navigator as any).standalone === true ||
                              window.matchMedia('(display-mode: standalone)').matches

    // iOS Safari에서만 PWA 설치 가능
    const canInstall = isIOS && isSafari && !isInStandaloneMode

    setIOSState({
      isIOS,
      isInStandaloneMode,
      isSafari,
      canInstall,
    })

    // Standalone 모드 변경 감지 (미래를 위한 준비)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIOSState(prev => ({
        ...prev,
        isInStandaloneMode: e.matches || (window.navigator as any).standalone === true
      }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return iosState
}