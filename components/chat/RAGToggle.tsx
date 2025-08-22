'use client'

import { FileText, Info, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDocuments } from '@/hooks/useDocuments'

interface RAGToggleProps {
  sessionId?: string
  useRAG: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
  className?: string
}

export function RAGToggle({ 
  sessionId, 
  useRAG, 
  onToggle, 
  disabled = false, 
  className = '' 
}: RAGToggleProps) {
  const { documentCount, isLoading } = useDocuments({ 
    sessionId, 
    autoLoad: true 
  })

  const handleToggle = () => {
    if (!disabled && documentCount > 0) {
      onToggle(!useRAG)
    }
  }

  const isDisabled = disabled || documentCount === 0 || isLoading

  return (
    <div className={`${className}`}>
      <Card className={`transition-all duration-200 ${
        useRAG ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
      } ${isDisabled ? 'opacity-50' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`
                p-2 rounded-lg transition-colors shrink-0
                ${useRAG ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">RAG 기능</h3>
                  {useRAG && (
                    <Badge variant="default" className="bg-blue-500 text-xs shrink-0">
                      활성화
                    </Badge>
                  )}
                </div>
                
                <div className="mt-1">
                  {isLoading ? (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400" />
                      <span>문서 확인 중...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 block">
                        {documentCount > 0 
                          ? `${documentCount}개 문서 사용 가능`
                          : '사용 가능한 문서 없음'
                        }
                      </span>
                      {documentCount === 0 && (
                        <div className="flex items-center space-x-1">
                          <Info className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="text-xs text-amber-600 truncate">
                            문서를 먼저 업로드하세요
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 shrink-0">
              {/* RAG 설정 버튼 (향후 확장용) */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: RAG 설정 모달 열기
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* 토글 스위치 */}
              <button
                onClick={handleToggle}
                disabled={isDisabled}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
                  ${useRAG ? 'bg-blue-600' : 'bg-gray-200'}
                  ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out
                    ${useRAG ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* RAG 활성화 시 추가 정보 */}
          {useRAG && documentCount > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 sm:space-x-2 text-blue-700">
                  <span className="whitespace-nowrap">📄 관련 문서 자동 검색</span>
                  <span className="whitespace-nowrap">🎯 정확도 향상</span>
                  <span className="whitespace-nowrap">📚 컨텍스트 제공</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300 shrink-0 self-start sm:self-center">
                  최대 5개 문서
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}