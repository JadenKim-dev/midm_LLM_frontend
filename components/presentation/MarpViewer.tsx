'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Presentation } from '@/lib/types'

interface MarpViewerProps {
  presentation: Presentation
  onClose?: () => void
}

export default function MarpViewer({ presentation, onClose }: MarpViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Marp 마크다운을 슬라이드별로 분할
    const slideContent = presentation.marp_content
      .split('---')
      .filter(slide => slide.trim())
      .map(slide => slide.trim())
    
    setSlides(slideContent)
    setCurrentSlide(0)
  }, [presentation.marp_content])

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

  const renderMarkdown = (markdown: string) => {
    // 간단한 마크다운 렌더링 (실제로는 마크다운 파서 라이브러리 사용 권장)
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

  if (slides.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>슬라이드를 로드하는 중...</p>
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
          <div className={`bg-white border rounded-lg p-8 ${isFullscreen ? 'flex-1 flex items-center justify-center' : 'min-h-96'}`}>
            <div 
              className={`prose max-w-none ${isFullscreen ? 'text-center max-w-4xl' : ''}`}
              dangerouslySetInnerHTML={{ 
                __html: `<div class="mb-4">${renderMarkdown(slides[currentSlide])}</div>` 
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
    </div>
  )
}