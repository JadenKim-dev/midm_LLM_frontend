'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SessionStorage } from '@/lib/sessionStorage'

export function SessionInfo() {
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string | null
    timeUntilExpiry: string | null
    isValid: boolean
  }>({
    sessionId: null,
    timeUntilExpiry: null,
    isValid: false
  })

  const updateSessionInfo = () => {
    const sessionId = SessionStorage.getSession()
    const timeUntilExpiry = SessionStorage.getFormattedTimeUntilExpiry()
    const isValid = SessionStorage.isSessionValid()

    setSessionInfo({
      sessionId,
      timeUntilExpiry,
      isValid
    })
  }

  useEffect(() => {
    updateSessionInfo()
    
    // 1분마다 세션 정보 업데이트
    const interval = setInterval(updateSessionInfo, 60000)
    
    return () => clearInterval(interval)
  }, [])

  if (!sessionInfo.isValid) {
    return null
  }

  return (
    <Card className="mb-4 bg-gray-50 border-gray-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">세션:</span> {sessionInfo.sessionId?.slice(-8)}
          </div>
          {sessionInfo.timeUntilExpiry && (
            <div>
              <span className="font-medium">만료까지:</span> {sessionInfo.timeUntilExpiry}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}