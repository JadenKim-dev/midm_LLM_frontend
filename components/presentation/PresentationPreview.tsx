'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { ConversionRequest, StreamingChunk, Presentation, Analysis } from '@/lib/types'

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
      const response = await fetch('/api/presentation/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_id: analysis.analysis_id,
          theme: selectedTheme
        } as ConversionRequest),
      })

      if (!response.ok) {
        throw new Error('변환 요청 실패')
      }

      // SSE 스트림 처리
      const reader = response.body?.getReader()
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
        if (chunk.content) {
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

  const downloadMarp = () => {
    if (!completedPresentation) return

    const blob = new Blob([completedPresentation.marp_content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${completedPresentation.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                {analysis.content.substring(0, 200)}...
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  {marpContent}
                  {isConverting && (
                    <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
                  )}
                </pre>
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
                  onClick={downloadMarp}
                >
                  다운로드
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