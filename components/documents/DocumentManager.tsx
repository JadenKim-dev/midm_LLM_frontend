'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DocumentUpload } from './DocumentUpload'
import { DocumentList } from './DocumentList'
import { Document, DocumentUploadResponse } from '@/lib/types'
import { apiClient } from '@/lib/api'

interface DocumentManagerProps {
  sessionId: string
  className?: string
}

export function DocumentManager({ sessionId, className = '' }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 문서 목록 로드
  const loadDocuments = useCallback(async (showRefreshing = false) => {
    if (!sessionId) return

    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    setError(null)

    try {
      const response = await apiClient.getSessionDocuments(sessionId)
      setDocuments(response.documents)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '문서 목록을 불러올 수 없습니다.'
      setError(errorMsg)
      console.error('Failed to load documents:', err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [sessionId])

  // 컴포넌트 마운트 시 문서 목록 로드
  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // 업로드 성공 핸들러
  const handleUploadSuccess = useCallback((response: DocumentUploadResponse) => {
    // 업로드된 문서를 목록에 추가 (실제로는 전체 목록을 다시 로드하는 것이 더 안전)
    loadDocuments()
  }, [loadDocuments])

  // 업로드 에러 핸들러
  const handleUploadError = useCallback((errorMsg: string) => {
    setError(errorMsg)
  }, [])

  // 문서 삭제 핸들러
  const handleDocumentDeleted = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.document_id !== documentId))
  }, [])

  // 에러 핸들러
  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg)
  }, [])

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    loadDocuments(true)
  }, [loadDocuments])

  // 에러 닫기
  const handleErrorClose = useCallback(() => {
    setError(null)
  }, [])

  if (!sessionId) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            세션을 먼저 생성해주세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">문서 관리</h2>
          <p className="text-gray-600">
            RAG 기능을 위한 문서를 업로드하고 관리하세요.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleErrorClose}
              className="h-auto p-1 ml-2"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 문서 업로드 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">파일 업로드</h3>
        <DocumentUpload
          sessionId={sessionId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          disabled={isLoading}
        />
      </div>

      {/* 문서 목록 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">업로드된 문서</h3>
          {documents.length > 0 && (
            <span className="text-sm text-gray-500">
              총 {documents.length}개
            </span>
          )}
        </div>
        
        <DocumentList
          documents={documents}
          onDocumentDeleted={handleDocumentDeleted}
          onError={handleError}
          isLoading={isLoading}
        />
      </div>

      {/* 도움말 섹션 */}
      {documents.length === 0 && !isLoading && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 도움말</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• PDF, DOCX, TXT 파일을 업로드할 수 있습니다</li>
            <li>• 업로드된 문서는 RAG 기능에서 컨텍스트로 사용됩니다</li>
            <li>• 파일 크기는 최대 10MB까지 지원합니다</li>
            <li>• 문서는 세션별로 관리되며, 다른 세션에서는 보이지 않습니다</li>
          </ul>
        </div>
      )}
    </div>
  )
}