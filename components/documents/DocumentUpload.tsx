'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api'
import { DocumentUploadResponse } from '@/lib/types'

interface DocumentUploadProps {
  sessionId: string
  onUploadSuccess?: (response: DocumentUploadResponse) => void
  onUploadError?: (error: string) => void
  className?: string
  disabled?: boolean
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentUpload({ 
  sessionId, 
  onUploadSuccess, 
  onUploadError, 
  className = '',
  disabled = false
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || !sessionId) return

    const file = acceptedFiles[0]
    if (!file) return

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = '파일 크기는 10MB 이하여야 합니다.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    setError(null)
    setSuccess(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // 진행률 시뮬레이션 (실제 업로드 진행률은 브라우저 API 제한으로 구현 어려움)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await apiClient.uploadDocument(file, sessionId)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      const successMsg = `${file.name}이 성공적으로 업로드되었습니다. (${response.chunks_count}개 청크)`
      setSuccess(successMsg)
      onUploadSuccess?.(response)
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '파일 업로드에 실패했습니다.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [sessionId, disabled, onUploadSuccess, onUploadError])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: disabled || uploading,
    maxSize: MAX_FILE_SIZE
  })

  // 파일 거부 에러 처리
  const rejectionError = fileRejections[0]?.errors[0]
  const rejectionErrorMsg = rejectionError?.code === 'file-too-large' 
    ? '파일 크기는 10MB 이하여야 합니다.'
    : rejectionError?.code === 'file-invalid-type'
    ? 'PDF, DOCX, TXT 파일만 업로드 가능합니다.'
    : null

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">업로드 중...</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, TXT 파일 지원 (최대 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {(error || rejectionErrorMsg) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || rejectionErrorMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* 성공 메시지 */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* 업로드 버튼 (대안) */}
      <div className="flex justify-center">
        <Button
          onClick={() => document.getElementById('file-input')?.click()}
          disabled={disabled || uploading}
          variant="outline"
          className="w-full max-w-xs"
        >
          <File className="h-4 w-4 mr-2" />
          파일 선택
        </Button>
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onDrop([file])
          }}
          disabled={disabled || uploading}
        />
      </div>
    </div>
  )
}