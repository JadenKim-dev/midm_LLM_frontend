'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { Presentation, PresentationListResponse } from '@/lib/types'
import { apiClient } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PresentationListProps {
  sessionId: string
  onPresentationSelect?: (presentation: Presentation) => void
  refreshTrigger?: number
}

export default function PresentationList({ sessionId, onPresentationSelect, refreshTrigger }: PresentationListProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPresentations = async () => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.getPresentationList(sessionId)
      setPresentations(data.presentations)
    } catch (error) {
      console.error('발표자료 목록 조회 오류:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPresentations()
  }, [sessionId, refreshTrigger])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadPresentation = (presentation: Presentation) => {
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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>발표자료 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>발표자료 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchPresentations} variant="outline">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>발표자료 목록</CardTitle>
        <Button onClick={fetchPresentations} variant="outline" size="sm">
          새로고침
        </Button>
      </CardHeader>
      <CardContent>
        {presentations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>아직 생성된 발표자료가 없습니다.</p>
            <p className="text-sm mt-2">주제 분석을 통해 발표자료를 생성해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {presentations.map((presentation) => (
              <div
                key={presentation.presentation_id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onPresentationSelect?.(presentation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">{presentation.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{presentation.theme}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadPresentation(presentation)
                      }}
                    >
                      다운로드
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  주제: {presentation.topic}
                </p>
                
                <div className="text-sm text-gray-500 mb-3 max-h-16 overflow-hidden">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-1 text-xs leading-relaxed" {...props} />,
                        h1: ({node, ...props}) => <span className="text-xs font-bold" {...props} />,
                        h2: ({node, ...props}) => <span className="text-xs font-semibold" {...props} />,
                        h3: ({node, ...props}) => <span className="text-xs font-medium" {...props} />,
                        ul: ({node, ...props}) => <span className="text-xs" {...props} />,
                        ol: ({node, ...props}) => <span className="text-xs" {...props} />,
                        li: ({node, ...props}) => <span className="text-xs" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-xs" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-200 px-1 rounded text-xs font-mono" {...props} />,
                      }}
                    >
                      {truncateContent(presentation.content)}
                    </ReactMarkdown>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>생성일: {formatDate(presentation.created_at)}</span>
                  <span>수정일: {formatDate(presentation.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}