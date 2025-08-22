'use client'

import { useEffect, useState, useRef } from 'react'
import { Marp } from '@marp-team/marp-core'

interface MarpRendererProps {
  markdown: string
  theme?: string
  className?: string
}

export default function MarpRenderer({ markdown, theme = 'default', className = '' }: MarpRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [css, setCss] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderMarp = async () => {
      try {
        const marp = new Marp({
          theme: theme,
          html: true,
          breaks: false,
          markdown: {
            breaks: false,
            linkify: true,
          },
        })

        // 기본 테마들을 로드
        if (theme === 'gaia') {
          marp.themeSet.add(`
            /* @theme gaia */
            section {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              justify-content: center;
              text-align: center;
              padding: 80px;
            }
            h1, h2, h3 { color: white; }
            h1 { font-size: 2.5em; margin-bottom: 0.5em; }
            h2 { font-size: 2em; margin-bottom: 0.75em; }  
            ul, ol { text-align: left; display: inline-block; }
            li { margin-bottom: 0.5em; }
          `)
        } else if (theme === 'uncover') {
          marp.themeSet.add(`
            /* @theme uncover */
            section {
              background: #fafafa;
              color: #333;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              justify-content: center;
              text-align: center;
              padding: 80px;
            }
            h1 { 
              color: #2563eb; 
              font-size: 2.5em; 
              margin-bottom: 0.5em;
              font-weight: bold;
            }
            h2 { 
              color: #1e40af; 
              font-size: 2em; 
              margin-bottom: 0.75em; 
            }
            ul, ol { text-align: left; display: inline-block; }
            li { margin-bottom: 0.5em; }
          `)
        } else {
          // 기본 테마
          marp.themeSet.add(`
            /* @theme default */
            section {
              background: white;
              color: #333;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              justify-content: center;
              text-align: center;
              padding: 80px;
              border: 1px solid #e5e7eb;
            }
            h1 { 
              color: #1f2937; 
              font-size: 2.5em; 
              margin-bottom: 0.5em;
              font-weight: bold;
            }
            h2 { 
              color: #374151; 
              font-size: 2em; 
              margin-bottom: 0.75em; 
            }
            h3 { 
              color: #4b5563; 
              font-size: 1.5em; 
              margin-bottom: 0.75em; 
            }
            ul, ol { text-align: left; display: inline-block; }
            li { margin-bottom: 0.5em; }
            strong { color: #1f2937; }
          `)
        }

        const { html, css: marpCss } = marp.render(markdown)
        
        setHtmlContent(html)
        setCss(marpCss)
      } catch (error) {
        console.error('Marp 렌더링 오류:', error)
        setHtmlContent(`<div class="error">Marp 렌더링 중 오류가 발생했습니다: ${error}</div>`)
      }
    }

    renderMarp()
  }, [markdown, theme])

  useEffect(() => {
    // CSS를 동적으로 주입
    if (css) {
      const styleId = 'marp-renderer-styles'
      let styleElement = document.getElementById(styleId) as HTMLStyleElement
      
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }
      
      styleElement.textContent = css + `
        .marp-renderer section {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .marp-renderer img {
          max-width: 100%;
          height: auto;
        }
      `
    }

    return () => {
      // 컴포넌트 언마운트 시 스타일 제거
      const styleElement = document.getElementById('marp-renderer-styles')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [css])

  return (
    <div 
      ref={containerRef}
      className={`marp-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}