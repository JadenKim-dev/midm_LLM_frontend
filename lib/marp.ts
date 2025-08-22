// Marp 렌더링 유틸리티
import { Marp } from '@marp-team/marp-core'

export interface MarpSlide {
  html: string
  index: number
}

export class MarpRenderer {
  private marp: typeof Marp

  constructor() {
    this.marp = new Marp({
      html: true,
      breaks: false,
      markdown: {
        breaks: false,
        html: true
      }
    })
  }

  /**
   * Marp 마크다운을 HTML 슬라이드로 변환
   */
  async renderSlides(markdown: string): Promise<MarpSlide[]> {
    try {
      const { html, css } = this.marp.render(markdown)
      
      // CSS를 head에 추가 (이미 추가되지 않은 경우)
      if (!document.getElementById('marp-styles')) {
        const style = document.createElement('style')
        style.id = 'marp-styles'
        style.textContent = css
        document.head.appendChild(style)
      }

      // HTML을 개별 슬라이드로 분할
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const sections = doc.querySelectorAll('section')
      
      const slides: MarpSlide[] = Array.from(sections).map((section, index) => ({
        html: section.outerHTML,
        index
      }))

      return slides
    } catch (error) {
      console.error('Marp 렌더링 오류:', error)
      
      // 폴백: 간단한 마크다운 파싱
      return this.fallbackRender(markdown)
    }
  }

  /**
   * Marp가 실패할 경우 사용할 폴백 렌더러
   */
  private fallbackRender(markdown: string): MarpSlide[] {
    const slides = markdown
      .split(/^---$/gm)
      .filter(slide => slide.trim())
      .map((slide, index) => ({
        html: `<section class="marp-slide"><div class="slide-content">${this.renderMarkdown(slide.trim())}</div></section>`,
        index
      }))

    return slides
  }

  /**
   * 간단한 마크다운 렌더링 (폴백용)
   */
  private renderMarkdown(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-center">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-semibold mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-medium mb-3">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
  }
}

// 전역 인스턴스
export const marpRenderer = new MarpRenderer()