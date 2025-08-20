import React from 'react'

// Simple markdown-like component using shadcn styling (no code blocks)
const MarkdownRenderer = ({ children, className = "" }) => {
  if (!children) return null

  // Simple markdown parsing - handles basic cases (no code blocks)
  const parseMarkdown = (text) => {
    if (typeof text !== 'string') return text

    // Process inline markdown only
    return processInlineMarkdown(text)
  }

  const processInlineMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, index, array) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold my-4">{line.slice(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold my-3">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold my-2">{line.slice(4)}</h3>
        }

        // Handle bold and italic (but not code blocks)
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')

        // Handle bullet points
        if (line.trim().startsWith('- ')) {
          return (
            <div key={index} className="flex items-start my-1">
              <span className="mr-2">•</span>
              <span dangerouslySetInnerHTML={{ __html: processedLine.replace(/^- /, '') }} />
            </div>
          )
        }

        // Handle numbered lists
        if (/^\d+\. /.test(line.trim())) {
          const match = line.match(/^(\d+)\. (.*)/)
          if (match) {
            return (
              <div key={index} className="flex items-start my-1">
                <span className="mr-2">{match[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: processedLine.replace(/^\d+\. /, '') }} />
              </div>
            )
          }
        }

        // Regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="my-2">
              <span dangerouslySetInnerHTML={{ __html: processedLine }} />
            </p>
          )
        }

        // Empty lines
        if (index < array.length - 1) {
          return <br key={index} />
        }
        return null
      })
      .filter(Boolean)
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseMarkdown(children)}
    </div>
  )
}

export default MarkdownRenderer
