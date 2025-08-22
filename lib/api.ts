import { 
  Session, 
  ChatResponse, 
  HealthStatus, 
  DocumentUploadResponse,
  DocumentListResponse,
  DocumentChunksResponse,
  StreamChunk,
  AnalysisRequest,
  ConversionRequest,
  PresentationListResponse,
} from './types'

export class ApiClient {
  private baseUrl: string
  private backendUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
    this.backendUrl = 'https://midm-chatbot-api.ap-northeast-2.arkain.site/api'
  }

  async createSession(metadata?: Record<string, any>): Promise<Session> {
    const response = await fetch(`${this.backendUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata || {}),
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`)
    }

    return response.json()
  }

  async getMessages(sessionId: string): Promise<ChatResponse> {
    const response = await fetch(`${this.backendUrl}/sessions/${sessionId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.status}`)
    }

    return response.json()
  }

  async sendMessage(
    sessionId: string,
    message: string,
    options?: {
      max_new_tokens?: number
      temperature?: number
      do_sample?: boolean
      use_rag?: boolean
      top_k?: number
    }
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.backendUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        max_new_tokens: options?.max_new_tokens || 256,
        temperature: options?.temperature || 0.7,
        do_sample: options?.do_sample !== false,
        use_rag: options?.use_rag || false,
        top_k: options?.top_k || 5,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body received')
    }

    return response.body
  }

  async sendRAGMessage(
    sessionId: string,
    message: string,
    options?: {
      max_new_tokens?: number
      temperature?: number
      do_sample?: boolean
      top_k?: number
    }
  ): Promise<ReadableStream> {
    return this.sendMessage(sessionId, message, {
      ...options,
      use_rag: true
    })
  }


  async *parseStreamResponse(stream: ReadableStream): AsyncGenerator<StreamChunk> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 마지막 라인은 불완전할 수 있으므로 버퍼에 보관
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            
            if (dataStr === '[DONE]') {
              yield { type: 'done', done: true }
              return
            }
            
            try {
              const data = JSON.parse(dataStr)
              
              // 백엔드 스트리밍 응답 구조에 맞게 처리
              if (data.type === 'start') {
                // 스트리밍 시작 신호 - UI에서 로딩 표시 등에 사용 가능
                continue
              }
              
              if (data.type === 'token' && data.content) {
                yield { type: 'content', content: data.content }
              }
              
              if (data.type === 'complete') {
                // RAG 컨텍스트 정보가 있다면 전달
                if (data.rag_context && data.rag_context.length > 0) {
                  yield { type: 'context', context_info: data.rag_context }
                }
                yield { type: 'done', done: true }
                return
              }
              
              if (data.type === 'error') {
                throw new Error(data.message || 'Stream error occurred')
              }
              
            } catch (e) {
              if (e instanceof Error && e.message.includes('Stream error')) {
                throw e
              }
              // JSON 파싱 에러 무시 (부분적인 데이터일 수 있음)
              console.warn('Failed to parse stream chunk:', dataStr, e)
              continue
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }

    return response.json()
  }

  async uploadDocument(file: File, sessionId: string): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', sessionId)

    const response = await fetch(`${this.backendUrl}/documents/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.status}`)
    }

    return response.json()
  }

  async getSessionDocuments(sessionId: string): Promise<DocumentListResponse> {
    const response = await fetch(`${this.backendUrl}/documents?session_id=${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get documents: ${response.status}`)
    }

    return response.json()
  }

  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${this.backendUrl}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.status}`)
    }
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunksResponse> {
    const response = await fetch(`${this.backendUrl}/documents/${documentId}/chunks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get document chunks: ${response.status}`)
    }

    return response.json()
  }

  // 발표자료 관련 메서드들
  async analyzeTopicStream(request: AnalysisRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.backendUrl}/presentations/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to analyze topic: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body received')
    }

    return response.body
  }

  async convertToPresentationStream(request: ConversionRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.backendUrl}/presentations/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to convert to presentation: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body received')
    }

    return response.body
  }

  async getPresentationList(sessionId: string): Promise<PresentationListResponse> {
    const response = await fetch(`${this.backendUrl}/presentations/list/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get presentation list: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
