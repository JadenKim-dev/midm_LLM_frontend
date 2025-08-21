// 세션 저장소 관리 유틸리티

interface StoredSession {
  sessionId: string
  timestamp: number
  expiresAt: number
}

const SESSION_STORAGE_KEY = 'midm_chat_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24시간 (밀리초)

export class SessionStorage {
  /**
   * 세션 저장
   */
  static saveSession(sessionId: string): void {
    const now = Date.now()
    const storedSession: StoredSession = {
      sessionId,
      timestamp: now,
      expiresAt: now + SESSION_DURATION
    }
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession))
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error)
    }
  }

  /**
   * 저장된 세션 가져오기 (만료 확인 포함)
   */
  static getSession(): string | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!stored) return null

      const storedSession: StoredSession = JSON.parse(stored)
      const now = Date.now()

      // 만료 시간 확인
      if (now > storedSession.expiresAt) {
        // 만료된 세션 제거
        this.clearSession()
        return null
      }

      return storedSession.sessionId
    } catch (error) {
      console.warn('Failed to get session from localStorage:', error)
      // 잘못된 데이터가 있으면 제거
      this.clearSession()
      return null
    }
  }

  /**
   * 세션 정보 확인 (만료 시간 포함)
   */
  static getSessionInfo(): StoredSession | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!stored) return null

      const storedSession: StoredSession = JSON.parse(stored)
      const now = Date.now()

      // 만료 시간 확인
      if (now > storedSession.expiresAt) {
        this.clearSession()
        return null
      }

      return storedSession
    } catch (error) {
      console.warn('Failed to get session info from localStorage:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * 세션 제거
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear session from localStorage:', error)
    }
  }

  /**
   * 세션이 유효한지 확인
   */
  static isSessionValid(): boolean {
    return this.getSession() !== null
  }

  /**
   * 세션 만료까지 남은 시간 (밀리초)
   */
  static getTimeUntilExpiry(): number | null {
    const sessionInfo = this.getSessionInfo()
    if (!sessionInfo) return null

    const now = Date.now()
    const timeLeft = sessionInfo.expiresAt - now
    return Math.max(0, timeLeft)
  }

  /**
   * 세션 만료까지 남은 시간 (사람이 읽기 쉬운 형태)
   */
  static getFormattedTimeUntilExpiry(): string | null {
    const timeLeft = this.getTimeUntilExpiry()
    if (timeLeft === null) return null

    const hours = Math.floor(timeLeft / (60 * 60 * 1000))
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    } else {
      return `${minutes}분`
    }
  }

  /**
   * 세션 연장 (새로운 만료 시간 설정)
   */
  static extendSession(): boolean {
    const currentSessionId = this.getSession()
    if (!currentSessionId) return false

    this.saveSession(currentSessionId)
    return true
  }
}