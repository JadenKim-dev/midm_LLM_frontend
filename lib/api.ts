import { 
  Session, 
  Message, 
  ChatResponse, 
  HealthStatus, 
  Document,
  DocumentUploadResponse,
  DocumentListResponse,
  DocumentChunksResponse,
  ChatRequest
} from './types'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  async createSession(metadata?: Record<string, any>): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
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
    const response = await fetch(`${this.baseUrl}/sessions?session_id=${sessionId}`, {
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
    }
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        max_new_tokens: options?.max_new_tokens || 10000,
        temperature: options?.temperature || 0.7,
        do_sample: options?.do_sample !== false,
        use_rag: options?.use_rag || false,
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

  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch('https://midm-chatbot-api.ap-northeast-2.arkain.site/api/health', {
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

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.status}`)
    }

    return response.json()
  }

  async getSessionDocuments(sessionId: string): Promise<DocumentListResponse> {
    const response = await fetch(`${this.baseUrl}/documents?session_id=${sessionId}`, {
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
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
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
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/chunks`, {
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
}

export const apiClient = new ApiClient()
