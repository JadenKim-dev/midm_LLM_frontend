'use client'

import { useState } from 'react'
import { FileText, Trash2, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Document } from '@/lib/types'
import { apiClient } from '@/lib/api'

interface DocumentListProps {
  documents: Document[]
  onDocumentDeleted?: (documentId: string) => void
  onError?: (error: string) => void
  className?: string
  isLoading?: boolean
}

export function DocumentList({ 
  documents, 
  onDocumentDeleted, 
  onError, 
  className = '',
  isLoading = false
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return

    setDeletingId(documentToDelete.document_id)
    
    try {
      await apiClient.deleteDocument(documentToDelete.document_id)
      onDocumentDeleted?.(documentToDelete.document_id)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '문서 삭제에 실패했습니다.'
      onError?.(errorMsg)
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  const formatFileType = (fileType: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'pdf': { label: 'PDF', color: 'bg-red-100 text-red-800' },
      'docx': { label: 'DOCX', color: 'bg-blue-100 text-blue-800' },
      'txt': { label: 'TXT', color: 'bg-gray-100 text-gray-800' }
    }
    return typeMap[fileType.toLowerCase()] || { label: fileType.toUpperCase(), color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">문서가 없습니다</h3>
            <p className="text-gray-500">
              파일을 업로드하여 RAG 기능을 사용해보세요.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{documents.length}개의 문서</h3>
      </div>

      <div className="space-y-3">
        {documents.map((document) => {
          const fileTypeInfo = formatFileType(document.file_type)
          const isDeleting = deletingId === document.document_id

          return (
            <Card key={document.document_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-gray-600 flex-shrink-0" />
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate" title={document.title}>
                        {document.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary"
                          className={fileTypeInfo.color}
                        >
                          {fileTypeInfo.label}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(document.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(document)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>문서 삭제</span>
            </DialogTitle>
            <DialogDescription>
              <strong>{documentToDelete?.title}</strong> 문서를 삭제하시겠습니까?
              <br />
              <span className="text-red-600">이 작업은 되돌릴 수 없습니다.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}