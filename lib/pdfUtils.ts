import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Presentation } from './types'

/**
 * Marp 콘텐츠를 PDF로 변환하여 다운로드
 */
export const downloadPresentationAsPDF = async (presentation: Presentation) => {
  try {
    // PDF 문서 생성 (A4 크기)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Marp 콘텐츠를 슬라이드별로 분할
    const slides = splitMarpContent(presentation.marp_content)
    
    // 각 슬라이드를 PDF 페이지로 추가
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }
      
      // 임시 div 생성해서 슬라이드 렌더링
      const slideElement = await createSlideElement(slides[i], presentation.theme || 'default')
      
      // HTML을 canvas로 변환
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Canvas를 PDF에 추가
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      
      // 임시 요소 제거
      document.body.removeChild(slideElement)
    }
    
    // PDF 다운로드
    pdf.save(`${presentation.title}.pdf`)
    
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    throw new Error('PDF 생성에 실패했습니다.')
  }
}

/**
 * Marp 콘텐츠를 개별 슬라이드로 분할
 */
function splitMarpContent(marpContent: string): string[] {
  // Marp 구분자(---)로 슬라이드 분할
  const parts = marpContent.split(/^---$/gm)
  
  // 첫 번째 부분이 Marp 헤더라면 제거
  let slides = parts
  if (parts[0] && parts[0].includes('marp: true')) {
    slides = parts.slice(1)
  }
  
  return slides.filter(slide => slide.trim().length > 0)
}

/**
 * 슬라이드를 렌더링할 임시 HTML 요소 생성
 */
async function createSlideElement(slideContent: string, theme: string): Promise<HTMLElement> {
  const slideDiv = document.createElement('div')
  slideDiv.style.cssText = `
    width: 1024px;
    height: 768px;
    padding: 60px;
    background: ${getThemeBackground(theme)};
    color: ${getThemeColor(theme)};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    position: absolute;
    top: -10000px;
    left: -10000px;
    box-sizing: border-box;
  `
  
  // 마크다운을 HTML로 변환 (간단한 변환)
  slideDiv.innerHTML = convertMarkdownToHTML(slideContent)
  
  // DOM에 추가 (렌더링을 위해)
  document.body.appendChild(slideDiv)
  
  // 렌더링 대기
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return slideDiv
}

/**
 * 테마별 배경색 반환
 */
function getThemeBackground(theme: string): string {
  switch (theme) {
    case 'gaia':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    case 'uncover':
      return '#fafafa'
    default:
      return '#ffffff'
  }
}

/**
 * 테마별 텍스트 색상 반환
 */
function getThemeColor(theme: string): string {
  switch (theme) {
    case 'gaia':
      return '#ffffff'
    case 'uncover':
      return '#333333'
    default:
      return '#1f2937'
  }
}

/**
 * 간단한 마크다운을 HTML로 변환
 */
function convertMarkdownToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1 style="font-size: 2.5em; margin-bottom: 0.5em; font-weight: bold;">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size: 2em; margin-bottom: 0.75em; font-weight: 600;">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.5em; margin-bottom: 0.75em; font-weight: 500;">$1</h3>')
    .replace(/^\* (.*$)/gm, '<li style="margin-bottom: 0.5em; text-align: left;">$1</li>')
    .replace(/^- (.*$)/gm, '<li style="margin-bottom: 0.5em; text-align: left;">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li style="margin-bottom: 0.5em; text-align: left;">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
    .replace(/\n\n/g, '</p><p style="margin-bottom: 1em;">')
    .replace(/\n/g, '<br>')
    .replace(/(<li[^>]*>.*<\/li>)/g, '<ul style="display: inline-block; text-align: left; margin: 1em 0;">$1</ul>')
}

/**
 * 마크다운 텍스트를 PDF로 다운로드 (폴백 함수)
 */
export const downloadMarkdownAsPDF = async (content: string, filename: string) => {
  try {
    const pdf = new jsPDF()
    
    // 간단한 텍스트 PDF 생성
    const lines = content.split('\n')
    let yPosition = 20
    
    pdf.setFontSize(12)
    
    for (const line of lines) {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }
      
      // 긴 줄은 자동으로 줄바꿈
      const splitLines = pdf.splitTextToSize(line, 180)
      pdf.text(splitLines, 10, yPosition)
      yPosition += splitLines.length * 5
    }
    
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    throw new Error('PDF 생성에 실패했습니다.')
  }
}