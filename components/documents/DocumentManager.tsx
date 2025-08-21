'use client'

import { useCallback } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DocumentUpload } from './DocumentUpload'
import { DocumentList } from './DocumentList'
import { DocumentUploadResponse } from '@/lib/types'
import { useDocuments } from '@/hooks/useDocuments'

interface DocumentManagerProps {
  sessionId: string
  className?: string
}

export function DocumentManager({ sessionId, className = '' }: DocumentManagerProps) {
  const {
    documents,
    documentCount,
    isLoading,
    isUploading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    hasDocuments,
    isEmpty
  } = useDocuments({ sessionId, autoLoad: true })

  // 업로드 성공 핸들러
  const handleUploadSuccess = useCallback((response: DocumentUploadResponse) => {
    // useDocuments 훅이 자동으로 문서 목록을 업데이트합니다
    console.log('Document uploaded successfully:', response)
  }, [])

  // 업로드 에러 핸들러  
  const handleUploadError = useCallback((errorMsg: string) => {
    console.error('Upload error:', errorMsg)
  }, [])

  // 문서 삭제 핸들러
  const handleDocumentDeleted = useCallback(async (documentId: string) => {
    try {
      await deleteDocument(documentId)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }, [deleteDocument])

  // 에러 핸들러
  const handleError = useCallback((errorMsg: string) => {
    console.error('Document error:', errorMsg)
  }, [])

  // 업로드 파일 핸들러
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const response = await uploadDocument(file)
      handleUploadSuccess(response!)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '파일 업로드에 실패했습니다.'
      handleUploadError(errorMsg)
      throw err
    }
  }, [uploadDocument, handleUploadSuccess, handleUploadError])

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
          onClick={refreshDocuments}
          disabled={isLoading || isUploading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
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
          onFileUpload={handleFileUpload}
          disabled={isLoading || isUploading}
        />
      </div>

      {/* 문서 목록 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">업로드된 문서</h3>
          {hasDocuments && (
            <span className="text-sm text-gray-500">
              총 {documentCount}개
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
      {isEmpty && (
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