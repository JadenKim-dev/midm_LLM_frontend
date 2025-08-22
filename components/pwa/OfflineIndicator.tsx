'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine
      
      if (!isOnline && online) {
        // 오프라인에서 온라인으로 변경
        setShowReconnected(true)
        setTimeout(() => setShowReconnected(false), 3000) // 3초 후 숨김
      }
      
      setIsOnline(online)
    }

    // 초기 상태 설정
    setIsOnline(navigator.onLine)

    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [isOnline])

  // 온라인 상태일 때는 표시하지 않음 (재연결 메시지 제외)
  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
      <Alert variant={isOnline ? 'default' : 'destructive'} className="shadow-lg">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isOnline 
            ? '인터넷 연결이 복구되었습니다!' 
            : '오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.'
          }
        </AlertDescription>
      </Alert>
    </div>
  )
}