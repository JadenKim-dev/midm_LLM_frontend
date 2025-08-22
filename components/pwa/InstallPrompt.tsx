'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, X, Smartphone, Monitor, Zap } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installStep, setInstallStep] = useState<'prompt' | 'installing' | 'success' | 'error'>('prompt')
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // iOS 기기 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    // iOS에서는 beforeinstallprompt 이벤트가 없으므로 Android/Desktop만 처리
    if (isIOSDevice) {
      return
    }

    // PWA 설치 가능 여부 체크 (Android/Desktop)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA 설치 프롬프트 준비됨 (Android/Desktop)')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 이전에 설치를 거부했는지 확인
      const installDismissed = localStorage.getItem('pwa-install-dismissed')
      const installDismissedTime = localStorage.getItem('pwa-install-dismissed-time')
      
      if (installDismissed && installDismissedTime) {
        const dismissedTime = parseInt(installDismissedTime)
        const now = Date.now()
        const daysSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60 * 24)
        
        // 7일 후에 다시 표시
        if (daysSinceDismissed < 7) {
          return
        }
      }
      
      // 잠시 후 프롬프트 표시 (사용자가 페이지에 익숙해진 후)
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 10000) // 10초 후
    }

    // 이미 설치되었는지 확인
    const handleAppInstalled = () => {
      console.log('PWA가 설치되었습니다')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setInstallStep('success')
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-dismissed-time')
    }

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    // PWA 실행 모드 감지
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    setInstallStep('installing')
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 승인했습니다')
        setInstallStep('success')
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
        setInstallStep('error')
        handleDismiss()
      }
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error)
      setInstallStep('error')
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }

  // iOS, 이미 설치됨, 또는 프롬프트를 표시하지 않는 경우
  if (isIOS || isInstalled || !showInstallPrompt) {
    return null
  }

  const getInstallStepContent = () => {
    switch (installStep) {
      case 'installing':
        return {
          title: '앱 설치 중...',
          description: '잠시만 기다려주세요.',
          icon: <Download className="h-6 w-6 animate-pulse" />
        }
      case 'success':
        return {
          title: '설치 완료!',
          description: '이제 홈 화면에서 AI Chatbot을 사용할 수 있습니다.',
          icon: <Zap className="h-6 w-6 text-green-600" />
        }
      case 'error':
        return {
          title: '설치에 실패했습니다',
          description: '브라우저에서 수동으로 설치하거나 나중에 다시 시도해주세요.',
          icon: <X className="h-6 w-6 text-red-600" />
        }
      default:
        return {
          title: 'AI Chatbot 앱 설치',
          description: '더 빠르고 편리한 접근을 위해 앱을 설치하세요.',
          icon: <Download className="h-6 w-6" />
        }
    }
  }

  const stepContent = getInstallStepContent()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-sm">
      <Card className="border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {stepContent.icon}
              <CardTitle className="text-base">{stepContent.title}</CardTitle>
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
          <CardDescription className="text-sm">
            {stepContent.description}
          </CardDescription>
        </CardHeader>

        {installStep === 'prompt' && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* 장점들 */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>홈 화면에서 바로 접근</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Monitor className="h-4 w-4" />
                <span>전체 화면으로 앱처럼 사용</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>더 빠른 로딩과 오프라인 지원</span>
              </div>

              {/* 설치 버튼 */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  설치하기
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  size="sm"
                >
                  나중에
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {(installStep === 'success' || installStep === 'error') && (
          <CardContent className="pt-0">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full"
              size="sm"
            >
              확인
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}