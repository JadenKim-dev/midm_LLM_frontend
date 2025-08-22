'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Share, Plus, ArrowUp } from 'lucide-react'

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false)

  useEffect(() => {
    // iOS 기기 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    // Standalone 모드 확인 (이미 설치됨)
    const isStandalone = (window.navigator as any).standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches

    setIsIOS(isIOSDevice)
    setIsInStandaloneMode(isStandalone)

    // iOS이고 standalone이 아니며 이전에 닫지 않았다면 표시
    if (isIOSDevice && !isStandalone) {
      const dismissed = localStorage.getItem('ios-install-dismissed')
      const dismissTime = localStorage.getItem('ios-install-dismiss-time')
      
      if (dismissed && dismissTime) {
        const now = Date.now()
        const daysSinceDismiss = (now - parseInt(dismissTime)) / (1000 * 60 * 60 * 24)
        
        // 7일 후에 다시 표시
        if (daysSinceDismiss < 7) {
          return
        }
      }

      // 페이지 로드 후 15초 뒤에 표시
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 15000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('ios-install-dismissed', 'true')
    localStorage.setItem('ios-install-dismiss-time', Date.now().toString())
  }

  const handleDontShowAgain = () => {
    setShowPrompt(false)
    localStorage.setItem('ios-install-dismissed', 'true')
    localStorage.setItem('ios-install-dismiss-time', (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString()) // 30일 후
  }

  // iOS가 아니거나 이미 설치되었거나 프롬프트를 표시하지 않는 경우
  if (!isIOS || isInStandaloneMode || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <CardTitle className="text-base">AI Chatbot 설치</CardTitle>
                <CardDescription className="text-xs">
                  더 편리한 사용을 위해 앱으로 설치하세요
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* 설치 방법 안내 */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              Safari에서 홈 화면에 추가하는 방법:
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                  1
                </div>
                <div className="flex items-center space-x-1">
                  <span>하단의</span>
                  <div className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded">
                    <Share className="w-3 h-3" />
                  </div>
                  <span>버튼을 탭하세요</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                  2
                </div>
                <div className="flex items-center space-x-1">
                  <span>"홈 화면에 추가"</span>
                  <div className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span>선택</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                  3
                </div>
                <span>우측 상단의 "추가" 버튼 탭</span>
              </div>
            </div>
          </div>

          {/* 장점 표시 */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-blue-900">앱 설치 시 장점:</div>
            <div className="space-y-1 text-xs text-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span>홈 화면에서 바로 접근 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span>전체 화면으로 앱처럼 사용</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span>오프라인에서도 일부 기능 사용 가능</span>
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
              size="sm"
            >
              나중에
            </Button>
            <Button
              variant="ghost"
              onClick={handleDontShowAgain}
              size="sm"
              className="text-xs"
            >
              다시 보지 않기
            </Button>
          </div>

          {/* Safari 감지 안내 */}
          {!/Safari/.test(navigator.userAgent) && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              💡 Safari 브라우저에서만 홈 화면에 추가할 수 있습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}