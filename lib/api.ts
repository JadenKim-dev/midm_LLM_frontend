export interface Session {
  session_id: string
  created_at: string
  last_accessed: string
  metadata?: Record<string, any>
}

export interface Message {
  message_id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  token_usage?: Record<string, any>
}

export interface ChatResponse {
  session_id: string
  messages: Message[]
  total_count: number
}

export interface HealthStatus {
  status: string
  timestamp: string
  llm_server_available: boolean
  database_connected: boolean
}

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
}

export const apiClient = new ApiClient()
