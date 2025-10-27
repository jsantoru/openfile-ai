import './GameAnalysis.css'

function GameAnalysis({ analysis, loading, onGameClick }) {
  if (loading) {
    return (
      <div className="analysis-container">
        <div className="analysis-loading">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p>Analyzing your games with AI...</p>
          <p className="analysis-subtext">This may take 10-20 seconds</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  // Parse markdown links, bold text, and regular text
  const parseTextWithFormatting = (text) => {
    const parts = []
    let currentIndex = 0

    // Combined regex for links [text](url) and bold **text**
    const formatRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
    let match

    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index))
      }

      // Check if it's a link or bold
      if (match[1] && match[2]) {
        // It's a link [text](url)
        const linkUrl = match[2]
        const linkText = match[1]
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            onClick={(e) => {
              e.preventDefault()
              if (onGameClick) {
                onGameClick(linkUrl)
              }
            }}
            className="game-link"
          >
            {linkText}
          </a>
        )
      } else if (match[3]) {
        // It's bold **text**
        parts.push(
          <strong key={match.index}>{match[3]}</strong>
        )
      }

      currentIndex = match.index + match[0].length
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Format the analysis text with better structure
  const formatAnalysis = (text) => {
    const lines = text.split('\n')
    const elements = []
    let currentSection = null
    let listItems = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="analysis-list">
              {listItems}
            </ul>
          )
          listItems = []
        }
        return
      }

      // Check for headers (lines that start AND end with **)
      if (trimmedLine.match(/^\*\*.*\*\*$/)) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="analysis-list">
              {listItems}
            </ul>
          )
          listItems = []
        }

        const headerText = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
        elements.push(
          <h3 key={`header-${index}`} className="analysis-header">
            {headerText}
          </h3>
        )
      }
      // Check for bullet points or numbered lists
      else if (trimmedLine.match(/^[-*•]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
        const itemText = trimmedLine.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '')
        listItems.push(
          <li key={`item-${index}`}>{parseTextWithFormatting(itemText)}</li>
        )
      }
      // Regular paragraph
      else {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="analysis-list">
              {listItems}
            </ul>
          )
          listItems = []
        }
        elements.push(
          <p key={`para-${index}`} className="analysis-paragraph">
            {parseTextWithFormatting(trimmedLine)}
          </p>
        )
      }
    })

    // Add any remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="analysis-list">
          {listItems}
        </ul>
      )
    }

    return elements
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header-section">
        <h2 className="analysis-title">AI Game Analysis</h2>
        <p className="analysis-subtitle">Personalized insights to improve your chess</p>
      </div>
      <div className="analysis-content">
        {formatAnalysis(analysis)}
      </div>
    </div>
  )
}

export default GameAnalysis
