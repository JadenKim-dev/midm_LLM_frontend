'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  isStandalone: boolean
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    isStandalone: false,
  })

  useEffect(() => {
    // 초기 상태 설정
    const updateOnlineStatus = () => {
      setPwaState(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    const checkInstallStatus = () => {
      // PWA가 설치되었거나 standalone 모드인지 확인
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true

      setPwaState(prev => ({
        ...prev,
        isInstalled: isStandalone,
        isStandalone
      }))
    }

    const handleBeforeInstallPrompt = () => {
      setPwaState(prev => ({ ...prev, canInstall: true }))
    }

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        isStandalone: true
      }))
    }

    // 초기 상태 체크
    updateOnlineStatus()
    checkInstallStatus()

    // 이벤트 리스너 등록
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return pwaState
}