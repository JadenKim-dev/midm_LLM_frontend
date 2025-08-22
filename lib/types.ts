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
  rag_context?: RAGContext[]
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

export interface Document {
  document_id: string
  title: string
  file_type: string
  created_at: string
  metadata?: Record<string, any>
}

export interface DocumentChunk {
  chunk_id: string
  chunk_index: number
  content: string
  embedding_id?: string
  created_at: string
}

export interface DocumentUploadResponse {
  document_id: string
  filename: string
  chunks_count: number
  embedding_ids: string[]
}

export interface DocumentListResponse {
  session_id: string
  documents: Document[]
  total_count: number
}

export interface DocumentChunksResponse {
  document_id: string
  chunks: DocumentChunk[]
  total_count: number
}

export interface RAGContext {
  document_id: string
  document_title: string
  chunk_content: string
  similarity_score: number
  chunk_id?: string
  chunk_index?: number
}

export interface ChatRequest {
  session_id: string
  message: string
  max_new_tokens?: number
  temperature?: number
  do_sample?: boolean
  use_rag?: boolean
  top_k?: number
}

// RAG 응답 관련 타입들
export interface RAGResponse {
  response: string
  context_used: RAGContext[]
  total_contexts: number
}

export interface StreamChunk {
  type: 'content' | 'context' | 'done'
  content?: string
  context_info?: RAGContext[]
  done?: boolean
}

// 확장된 Message 타입 (RAG 컨텍스트 정보 포함)
export interface ExtendedMessage extends Message {
  rag_contexts?: RAGContext[]
  is_rag_response?: boolean
}

// UI 관련 타입들
export type TabType = 'chat' | 'documents' | 'presentations'

export interface ChatUIOptions {
  useRAG: boolean
  maxTokens: number
  temperature: number
}

// 발표자료 관련 타입들
export interface AnalysisRequest {
  session_id: string
  topic: string
}

export interface Analysis {
  analysis_id: string
  session_id: string
  topic: string
  content: string
  created_at: string
}

export interface ConversionRequest {
  analysis_id: string
  theme?: string
}

export interface Presentation {
  presentation_id: string
  session_id: string
  title: string
  topic: string
  content: string
  marp_content: string
  theme: string
  created_at: string
  updated_at: string
}

export interface PresentationListResponse {
  session_id: string
  presentations: Presentation[]
  total_count: number
}

// 스트리밍 응답 타입들
export interface StreamingChunk {
  type: 'start' | 'progress' | 'content_chunk' | 'marp_chunk' | 'step_complete' | 'complete' | 'error'
  message?: string
  step?: string
  content?: string
  accumulated_content?: string  // 누적된 분석 내용
  accumulated_marp?: string     // 누적된 Marp 내용
  analysis_id?: string
  presentation_id?: string
  topic?: string
  analysis?: Analysis
  presentation?: Presentation
}