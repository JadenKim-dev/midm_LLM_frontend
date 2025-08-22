'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Presentation } from '@/lib/types'
import { marpRenderer, MarpSlide } from '@/lib/marp'

interface EnhancedMarpViewerProps {
  presentation: Presentation
  onClose?: () => void
}

export default function EnhancedMarpViewer({ presentation, onClose }: EnhancedMarpViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<MarpSlide[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderSlides = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const renderedSlides = await marpRenderer.renderSlides(presentation.marp_content)
        setSlides(renderedSlides)
        setCurrentSlide(0)
      } catch (err) {
        console.error('슬라이드 렌더링 오류:', err)
        setError('슬라이드를 렌더링할 수 없습니다.')
        
        // 폴백: 기본 분할 방식 사용
        const fallbackSlides = presentation.marp_content
          .split('---')
          .filter(slide => slide.trim())
          .map((slide, index) => ({
            html: `<div class="slide-content p-8">${renderMarkdown(slide.trim())}</div>`,
            index
          }))
        
        setSlides(fallbackSlides)
      } finally {
        setIsLoading(false)
      }
    }

    renderSlides()
  }, [presentation.marp_content])

  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-center">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-semibold mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-medium mb-3">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const downloadPresentation = () => {
    const blob = new Blob([presentation.marp_content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${presentation.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
          event.preventDefault()
          prevSlide()
          break
        case 'Home':
          event.preventDefault()
          goToSlide(0)
          break
        case 'End':
          event.preventDefault()
          goToSlide(slides.length - 1)
          break
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, slides.length, isFullscreen])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>슬라이드를 렌더링하는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || slides.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">{error || '슬라이드를 로드할 수 없습니다.'}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div ref={viewerRef} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className={`${isFullscreen ? 'h-full border-none' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{presentation.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{presentation.theme}</Badge>
              <span className="text-sm text-gray-500">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPresentation}
            >
              다운로드
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? '전체화면 종료' : '전체화면'}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                닫기
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`${isFullscreen ? 'h-full flex flex-col' : ''}`}>
          {/* 슬라이드 콘텐츠 */}
          <div className={`bg-white border rounded-lg overflow-hidden ${isFullscreen ? 'flex-1 flex items-center justify-center' : 'min-h-96'}`}>
            <div 
              className={`marp-slide w-full h-full flex items-center justify-center ${isFullscreen ? 'max-w-6xl max-h-full' : ''}`}
              dangerouslySetInnerHTML={{ 
                __html: slides[currentSlide]?.html || '' 
              }}
            />
          </div>

          {/* 슬라이드 네비게이션 */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              이전
            </Button>

            {/* 슬라이드 인디케이터 */}
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              다음
            </Button>
          </div>

          {/* 키보드 단축키 안내 */}
          {!isFullscreen && (
            <div className="text-xs text-gray-500 text-center mt-2">
              키보드: ←→ 슬라이드 이동, Home/End 처음/마지막, F11 전체화면
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marp 스타일링 */}
      <style jsx global>{`
        .marp-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .marp-slide section {
          width: 100%;
          max-width: 100%;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .slide-content {
          line-height: 1.6;
        }
        
        .slide-content h1 {
          color: #1f2937;
          margin-bottom: 1.5rem;
        }
        
        .slide-content h2 {
          color: #374151;
          margin-bottom: 1rem;
        }
        
        .slide-content ul, .slide-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}