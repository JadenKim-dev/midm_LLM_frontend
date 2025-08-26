'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { ConversionRequest, StreamingChunk, Presentation, Analysis } from '@/lib/types'
import { apiClient } from '@/lib/api'
import MarpRenderer from './MarpRenderer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { downloadPresentationAsPDF } from '@/lib/pdfUtils'

interface PresentationPreviewProps {
  analysis: Analysis
  sessionId: string
  onConversionComplete?: (presentation: Presentation) => void
}

export default function PresentationPreview({ analysis, sessionId, onConversionComplete }: PresentationPreviewProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [marpContent, setMarpContent] = useState('')
  const [currentStep, setCurrentStep] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [completedPresentation, setCompletedPresentation] = useState<Presentation | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('default')

  const themes = [
    { value: 'default', label: '기본' },
    { value: 'gaia', label: 'Gaia' },
    { value: 'uncover', label: 'Uncover' },
  ]

  const handleConvert = async () => {
    setIsConverting(true)
    setMarpContent('')
    setCurrentStep('')
    setCurrentMessage('')
    setCompletedPresentation(null)

    try {
      const request: ConversionRequest = {
        analysis_id: analysis.analysis_id,
        theme: selectedTheme
      }

      const stream = await apiClient.convertToPresentationStream(request)
      
      // SSE 스트림 처리
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data.trim()) {
              try {
                const parsed: StreamingChunk = JSON.parse(data)
                handleStreamChunk(parsed)
              } catch (e) {
                console.error('JSON 파싱 오류:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('변환 오류:', error)
      setCurrentMessage('변환 중 오류가 발생했습니다.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleStreamChunk = (chunk: StreamingChunk) => {
    switch (chunk.type) {
      case 'start':
        setCurrentMessage(chunk.message || '변환을 시작합니다...')
        break
        
      case 'progress':
        setCurrentStep(chunk.step || '')
        setCurrentMessage(chunk.message || '')
        break
        
      case 'marp_chunk':
        // 백엔드에서 보내는 accumulated_marp를 사용해서 토큰 누락 방지
        if (chunk.accumulated_marp) {
          setMarpContent(chunk.accumulated_marp)
        } else if (chunk.content) {
          setMarpContent(prev => prev + chunk.content)
        }
        break
        
      case 'step_complete':
        setCurrentMessage(chunk.message || '단계가 완료되었습니다.')
        break
        
      case 'complete':
        setCurrentMessage(chunk.message || '변환이 완료되었습니다!')
        if (chunk.presentation) {
          setCompletedPresentation(chunk.presentation)
          onConversionComplete?.(chunk.presentation)
        }
        break
        
      case 'error':
        setCurrentMessage(chunk.message || '오류가 발생했습니다.')
        console.error('변환 오류:', chunk.message)
        break
    }
  }

  const downloadAsPDF = async () => {
    if (!completedPresentation) return

    try {
      await downloadPresentationAsPDF(completedPresentation)
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>분석 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">주제: {analysis.topic}</h3>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 text-xs leading-relaxed" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-sm font-bold mb-1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-sm font-semibold mb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xs font-medium mb-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="mb-2 pl-3 space-y-0.5" {...props} />,
                      ol: ({node, ...props}) => <ol className="mb-2 pl-3 space-y-0.5" {...props} />,
                      li: ({node, ...props}) => <li className="text-xs" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-200 px-1 rounded text-xs font-mono" {...props} />,
                    }}
                  >
                    {analysis.content && analysis.content.trim().length > 0 
                      ? `${analysis.content.substring(0, 300)}...`
                      : '분석 내용이 없습니다.'
                    }
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium">테마 선택:</label>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                  disabled={isConverting}
                >
                  {themes.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting ? '변환중...' : 'PPT로 변환'}
              </Button>
            </div>

            {isConverting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentStep || 'marp_conversion'}</Badge>
                  <span className="text-sm text-gray-600">{currentMessage}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(marpContent || isConverting) && (
        <Card>
          <CardHeader>
            <CardTitle>Marp 변환 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {isConverting && !marpContent ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* 렌더링된 미리보기 */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="p-2 bg-gray-50 border-b text-sm font-medium">미리보기</div>
                  <div className="h-[600px] overflow-auto">
                    <MarpRenderer
                      markdown={marpContent + (isConverting ? '\n\n로딩 중...' : '')}
                      theme={selectedTheme}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                
                {/* 마크다운 소스 코드 */}
                <details className="bg-gray-50 rounded-lg">
                  <summary className="p-3 cursor-pointer text-sm font-medium hover:bg-gray-100">
                    마크다운 소스 보기
                  </summary>
                  <div className="p-4 border-t">
                    <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                      {marpContent}
                      {isConverting && (
                        <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
                      )}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {completedPresentation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">발표자료 변환이 완료되었습니다!</p>
                <p className="text-sm text-green-600">{completedPresentation.title}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsPDF}
                >
                  PDF 다운로드
                </Button>
                <Badge className="bg-green-100 text-green-800">완료</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}