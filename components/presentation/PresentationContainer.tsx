'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import PresentationGenerator from './PresentationGenerator'
import PresentationPreview from './PresentationPreview'
import PresentationList from './PresentationList'
import MarpViewer from './MarpViewer'
import { Analysis, Presentation } from '@/lib/types'

interface PresentationContainerProps {
  sessionId: string
}

type ViewMode = 'generator' | 'list' | 'viewer'

export default function PresentationContainer({ sessionId }: PresentationContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('generator')
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAnalysisComplete = (analysis: Analysis) => {
    setCurrentAnalysis(analysis)
  }

  const handleConversionComplete = (presentation: Presentation) => {
    setCurrentPresentation(presentation)
    setRefreshTrigger(prev => prev + 1)
    // 자동으로 뷰어로 이동하지 않고 사용자가 선택하도록 함
  }

  const handlePresentationSelect = (presentation: Presentation) => {
    setCurrentPresentation(presentation)
    setViewMode('viewer')
  }

  const handleCloseViewer = () => {
    setCurrentPresentation(null)
    setViewMode('list')
  }

  const resetToGenerator = () => {
    setCurrentAnalysis(null)
    setCurrentPresentation(null)
    setViewMode('generator')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 상단 네비게이션 */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>발표자료 생성</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'generator' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('generator')}
              >
                새로 만들기
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                목록 보기
              </Button>
              {currentPresentation && (
                <Button
                  variant={viewMode === 'viewer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('viewer')}
                >
                  슬라이드 보기
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'generator' && (
          <div className="h-full space-y-4 overflow-y-auto">
            <PresentationGenerator
              sessionId={sessionId}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
            {currentAnalysis && (
              <div className="mt-6">
                <PresentationPreview
                  analysis={currentAnalysis}
                  sessionId={sessionId}
                  onConversionComplete={handleConversionComplete}
                />
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="h-full overflow-y-auto">
            <PresentationList
              sessionId={sessionId}
              onPresentationSelect={handlePresentationSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {viewMode === 'viewer' && currentPresentation && (
          <div className="h-full overflow-y-auto">
            <MarpViewer
              presentation={currentPresentation}
              onClose={handleCloseViewer}
            />
          </div>
        )}
      </div>

      {/* 하단 상태 표시 */}
      {viewMode === 'generator' && (
        <Card className="mt-4">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  1단계: 주제 분석 {currentAnalysis ? '✓' : ''}
                </span>
                <span className="text-gray-500">
                  2단계: PPT 변환 {currentPresentation ? '✓' : ''}
                </span>
              </div>
              {(currentAnalysis || currentPresentation) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToGenerator}
                >
                  처음부터 다시
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}