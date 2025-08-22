'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { AnalysisRequest, StreamingChunk, Analysis } from '@/lib/types'
import { apiClient } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PresentationGeneratorProps {
  sessionId: string
  onAnalysisComplete?: (analysis: Analysis) => void
}

export default function PresentationGenerator({ sessionId, onAnalysisComplete }: PresentationGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisContent, setAnalysisContent] = useState('')
  const [currentStep, setCurrentStep] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [completedAnalysis, setCompletedAnalysis] = useState<Analysis | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)

  const handleAnalyze = async () => {
    if (!topic.trim()) return

    setIsAnalyzing(true)
    setAnalysisContent('')
    setCurrentStep('')
    setCurrentMessage('')
    setCompletedAnalysis(null)

    try {
      const request: AnalysisRequest = {
        session_id: sessionId,
        topic: topic.trim()
      }

      const stream = await apiClient.analyzeTopicStream(request)
      
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
      console.error('분석 오류:', error)
      setCurrentMessage('분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStreamChunk = (chunk: StreamingChunk) => {
    switch (chunk.type) {
      case 'start':
        setCurrentMessage(chunk.message || '분석을 시작합니다...')
        break
        
      case 'progress':
        setCurrentStep(chunk.step || '')
        setCurrentMessage(chunk.message || '')
        break
        
      case 'content_chunk':
        // 백엔드에서 보내는 accumulated_content를 사용해서 토큰 누락 방지
        if (chunk.accumulated_content) {
          setAnalysisContent(chunk.accumulated_content)
        } else if (chunk.content) {
          setAnalysisContent(prev => prev + chunk.content)
        }
        break
        
      case 'step_complete':
        setCurrentMessage(chunk.message || '단계가 완료되었습니다.')
        break
        
      case 'complete':
        setCurrentMessage(chunk.message || '분석이 완료되었습니다!')
        if (chunk.analysis) {
          setCompletedAnalysis(chunk.analysis)
          onAnalysisComplete?.(chunk.analysis)
        }
        break
        
      case 'error':
        setCurrentMessage(chunk.message || '오류가 발생했습니다.')
        console.error('분석 오류:', chunk.message)
        break
    }
  }

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  useEffect(() => {
    return cleanup
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>주제 분석</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="분석할 주제를 입력하세요..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
              disabled={isAnalyzing}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={!topic.trim() || isAnalyzing}
            >
              {isAnalyzing ? '분석중...' : '분석 시작'}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentStep || 'analysis'}</Badge>
                <span className="text-sm text-gray-600">{currentMessage}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(analysisContent || isAnalyzing) && (
        <Card>
          <CardHeader>
            <CardTitle>분석 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing && !analysisContent ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {analysisContent && analysisContent.trim().length > 0 ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 커스텀 컴포넌트로 스타일링 개선
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-gray-900" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-gray-800" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-medium mb-2 text-gray-700" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 text-gray-600 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="mb-3 pl-4 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="mb-3 pl-4 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-600" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-3" {...props} />,
                      table: ({node, ...props}) => <table className="min-w-full border border-gray-200 rounded-lg my-3" {...props} />,
                      thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                      th: ({node, ...props}) => <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200" {...props} />,
                      td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-600 border border-gray-200" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                      hr: ({node, ...props}) => <hr className="my-4 border-gray-300" {...props} />,
                    }}
                  >
                    {analysisContent}
                  </ReactMarkdown>
                ) : (
                  <div className="text-gray-500 italic">
                    {isAnalyzing ? '분석을 진행 중입니다...' : '분석 결과가 없습니다.'}
                  </div>
                )}
                {isAnalyzing && (
                  <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {completedAnalysis && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">분석이 완료되었습니다!</p>
                <p className="text-sm text-green-600">이제 발표자료로 변환할 수 있습니다.</p>
              </div>
              <Badge className="bg-green-100 text-green-800">완료</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}