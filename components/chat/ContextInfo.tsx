'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RAGContext } from '@/lib/types'

interface ContextInfoProps {
  contexts: RAGContext[]
  className?: string
}

export function ContextInfo({ contexts, className = '' }: ContextInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedContextIndex, setSelectedContextIndex] = useState<number | null>(null)

  if (!contexts || contexts.length === 0) {
    return null
  }

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className={`${className}`}>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-blue-100 rounded">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-medium text-blue-900">
                RAG 컨텍스트
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {contexts.length}개 문서
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-blue-600 hover:bg-blue-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  펼치기
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 요약 정보 */}
          {!isExpanded && (
            <div className="space-y-2">
              <div className="text-xs text-blue-700">
                다음 문서들을 참고하여 답변했습니다:
              </div>
              <div className="flex flex-wrap gap-1">
                {contexts.slice(0, 3).map((context, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer"
                    onClick={() => setIsExpanded(true)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {context.document_title}
                  </Badge>
                ))}
                {contexts.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-blue-300 text-blue-700 cursor-pointer"
                    onClick={() => setIsExpanded(true)}
                  >
                    +{contexts.length - 3}개 더
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 상세 정보 */}
          {isExpanded && (
            <div className="space-y-3">
              <div className="text-xs text-blue-700 mb-3">
                사용된 문서 컨텍스트 (유사도 순):
              </div>
              
              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {contexts.map((context, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-3 bg-white/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {context.document_title}
                          </span>
                        </div>
                        
                        <Badge 
                          className={`text-xs px-2 py-1 ${getScoreColor(context.similarity_score)}`}
                        >
                          {formatScore(context.similarity_score)}%
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {selectedContextIndex === index ? (
                          <div className="space-y-2">
                            <div className="whitespace-pre-wrap">
                              {context.chunk_content}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedContextIndex(null)}
                              className="h-6 px-2 text-blue-600"
                            >
                              접기
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-1">
                              {truncateContent(context.chunk_content)}
                            </div>
                            {context.chunk_content.length > 150 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedContextIndex(index)}
                                className="h-6 px-2 text-blue-600"
                              >
                                전체 보기
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* 통계 정보 */}
              <div className="border-t border-blue-200 pt-3 mt-3">
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>평균 유사도: {formatScore(contexts.reduce((acc, ctx) => acc + ctx.similarity_score, 0) / contexts.length)}%</span>
                  <span>최고 유사도: {formatScore(Math.max(...contexts.map(ctx => ctx.similarity_score)))}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}