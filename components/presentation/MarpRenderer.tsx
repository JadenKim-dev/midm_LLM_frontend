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
        // 빈 마크다운 처리
        if (!markdown || markdown.trim().length === 0) {
          setHtmlContent('<div class="text-gray-500 italic p-8 text-center">콘텐츠가 없습니다.</div>')
          setCss('')
          return
        }

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
              padding: 60px 80px;
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
              padding: 60px 80px;
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
          // 기본 테마 (goorm-default-theme)
          marp.themeSet.add(`
            /* @theme default */
            @import url("https://statics.goorm.io/fonts/GoormSans/v1.0.0/GoormSans.min.css");
            @import url("https://statics.goorm.io/fonts/GoormSansCode/v1.0.1/GoormSansCode.min.css");
            @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

            :root {
              --text-primary-rgb: 29, 108, 224;
              --text-primary-alternative-rgb: 25, 89, 184;
              --text-secondary-rgb: 108, 110, 126;
              --text-secondary-alternative-rgb: 82, 84, 99;
              --text-success-rgb: 8, 120, 94;
              --text-success-alternative-rgb: 10, 97, 77;
              --text-warning-rgb: 180, 82, 9;
              --text-warning-alternative-rgb: 151, 71, 7;
              --text-danger-rgb: 217, 28, 41;
              --text-danger-alternative-rgb: 174, 30, 39;
              --text-hint-rgb: 108, 110, 126;
              --text-hint-alternative-rgb: 82, 84, 99;
              --text-contrast-rgb: 62, 64, 76;
              --text-contrast-alternative-rgb: 43, 45, 54;
              --text-alternative-rgb: 82, 84, 99;
              --text-normal-rgb: 43, 45, 54;
              --text-light-rgb: 255, 255, 255;
              --text-exception-rgb: 255, 255, 255;

              --text-primary: rgb(var(--text-primary-rgb));
              --text-primary-alternative: rgb(var(--text-primary-alternative-rgb));
              --text-secondary: rgb(var(--text-secondary-rgb));
              --text-secondary-alternative: rgb(var(--text-secondary-alternative-rgb));
              --text-success: rgb(var(--text-success-rgb));
              --text-success-alternative: rgb(var(--text-success-alternative-rgb));
              --text-warning: rgb(var(--text-warning-rgb));
              --text-warning-alternative: rgb(var(--text-warning-alternative-rgb));
              --text-danger: rgb(var(--text-danger-rgb));
              --text-danger-alternative: rgb(var(--text-danger-alternative-rgb));
              --text-hint: rgb(var(--text-hint-rgb));
              --text-hint-alternative: rgb(var(--text-hint-alternative-rgb));
              --text-contrast: rgb(var(--text-contrast-rgb));
              --text-contrast-alternative: rgb(var(--text-contrast-alternative-rgb));
              --text-alternative: rgb(var(--text-alternative-rgb));
              --text-normal: rgb(var(--text-normal-rgb));
              --text-light: rgb(var(--text-light-rgb));
              --text-exception: rgb(var(--text-exception-rgb));
            }

            * {
              font-family: "Goorm Sans";
              font-weight: 500;
              word-break: keep-all;
              color: var(--text-normal);
            }

            .fas {
              font-family: "Font Awesome 6 Free" !important;
            }

            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-sizing: border-box;
              width: calc(100% - 80px);
              left: 40px;
              top: 40px;
            }

            header span {
              font-weight: bold;
              opacity: 0.5;
              font-size: 12px;
            }

            header img {
              width: 80px;
              height: auto;
            }

            footer {
              display: flex;
              justify-content: space-between;  
              box-sizing: border-box;
              width: calc(100% - 80px);
              left: 40px;
              bottom: 40px;
            }

            footer img {
              width: 140px;
              height: auto;
            }

            h1 {
              font-size: 16px;
              margin: 0;
              opacity: 0.7;
              border-left: 3px solid #ccc;
              padding-left: 10px;
              padding-top: 5px;
              box-sizing: border-box;
              color: rgba(var(--text-primary-alternative-rgb), 0.9);
            }

            h2 {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              font-size: 24px;
              margin-top: 5px;
              margin-bottom: 20px;
              box-sizing: border-box;
            }

            h2::before {
              content: "";
              display: inline-block;
              width: 3px;
              height: 30px;
              margin-right: 10px;
              background-color: rgba(0, 0, 0, 0.3);
            }

            h2::after {
              content: "";
              display: block;
              width: 100%;
              height: 1px;
              background-color: rgba(0, 0, 0, 0.1);
              margin-top: 10px;
            }

            h3 {
              font-size: 20px;
              margin-top: 20px;
              margin-bottom: 10px;
              font-weight: bold;
              border-left: 5px solid rgba(0, 0, 0, 0.3);
              padding-left: 8px;
              padding-top: 5px;
            }

            section {
              font-size: 18px;
              display: flex;
              justify-content: start;
              overflow: hidden;
              animation: fade 1s cubic-bezier(0.5, 0, 1, 1);
              padding: 80px 40px;
            }

            section::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-position: center;
              background-size: cover;
              background-repeat: no-repeat;
              background-image: url("./images/bg.png");
              mix-blend-mode: luminosity;
              opacity: 0.05;
              z-index: -1;
            }

            section strong {
              font-weight: bold !important;
              color: inherit !important;
            }

            section table {
              width: 100%;
              display: table;
            }

            section table tr {
              width: 100%;
            }

            section table th {
              background-color: rgba(0, 0, 0, 0.05);
            }

            section table th, section table td {
              width: auto;
              overflow-wrap: break-word;
              white-space: normal;
              border: 1px solid rgba(0, 0, 0, 0.1);
            }

            section:after {
              font-size: 18px;
              right: 40px;
              bottom: 40px;
            }

            section.cover {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            section.cover::before {
              mix-blend-mode: normal;
              opacity: 0.2;
            }

            section.cover h1 {
              font-size: 25px;
              opacity: 1;
              padding: 5px;
              margin: 5px;
              border: none;
            }

            section.cover h2 {
              font-size: 40px;
              padding: 5px;
              margin: 5px 5px 40px 5px;  
              border: none;
            }

            section.cover h2::before, section.cover h2::after {
              content: none;
              display: none;
            }

            section.sub_cover {
              display: flex;
              justify-content: center;
              background-color: #f6f6f6;
            }

            section.sub_cover::before {
              opacity: 0.15;
            }

            section.sub_cover h1 {
              font-size: 25px;
              padding: 5px 10px;
              margin: 5px 10px;
              opacity: 1;
              border: none;
            }

            section.sub_cover h2 {
              font-size: 40px;
              padding: 5px 10px;
              margin: 5px 10px;  
              border: none;
            }

            section.sub_cover h2::before, section.sub_cover h2::after {
              content: none;
              display: none;
            }
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
          min-height: 400px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transform-origin: center center;
        }
        .marp-renderer img {
          max-width: 100%;
          height: auto;
        }
        .marp-renderer {
          overflow: auto;
        }
        .marp-renderer section h1 {
          margin-top: 0;
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
      dangerouslySetInnerHTML={{ __html: htmlContent || '<div class="text-gray-500 italic p-8 text-center">콘텐츠를 로드하는 중...</div>' }}
    />
  )
}