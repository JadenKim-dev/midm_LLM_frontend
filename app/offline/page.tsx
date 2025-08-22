'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, RefreshCw, Home, MessageCircle } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // 초기 상태 설정
    setIsOnline(navigator.onLine)

    // 온라인/오프라인 이벤트 리스너
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleOfflineChat = () => {
    // 로컬 스토리지에 저장된 채팅 세션으로 이동
    const savedSessions = localStorage.getItem('chat-sessions')
    if (savedSessions) {
      window.location.href = '/?offline=true'
    } else {
      alert('저장된 채팅 세션이 없습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 상태 표시 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isOnline ? '페이지를 불러올 수 없습니다' : '오프라인 상태'}
          </h1>
          <p className="text-muted-foreground">
            {isOnline 
              ? '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
              : '인터넷 연결을 확인하고 다시 시도해주세요.'
            }
          </p>
        </div>

        {/* 연결 상태 */}
        <Alert variant={isOnline ? 'default' : 'destructive'}>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            현재 상태: {isOnline ? '온라인 (서버 연결 불가)' : '오프라인'}
            {retryCount > 0 && ` • 재시도: ${retryCount}회`}
          </AlertDescription>
        </Alert>

        {/* 오프라인 기능 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">오프라인에서 사용 가능한 기능</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">저장된 채팅 기록</div>
                <div className="text-sm text-muted-foreground">
                  이전 대화 내용을 확인할 수 있습니다
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
              <Home className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">로컬 설정</div>
                <div className="text-sm text-muted-foreground">
                  앱 설정과 사용자 선호도 관리
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>

            <Button 
              variant="outline" 
              onClick={handleOfflineChat}
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              오프라인 채팅
            </Button>
          </div>
        </div>

        {/* 도움말 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>문제가 지속되면 브라우저를 새로고침하거나</p>
          <p>잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    </div>
  )
}