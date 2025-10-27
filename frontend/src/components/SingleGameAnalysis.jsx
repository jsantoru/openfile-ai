import './SingleGameAnalysis.css'

function SingleGameAnalysis({ analysis, loading, gameNumber, onClose }) {
  if (!analysis && !loading) return null

  if (loading) {
    return (
      <div className="single-game-overlay">
        <div className="single-game-container">
          <button className="single-game-close" onClick={onClose}>
            ✕
          </button>
          <div className="single-game-loading">
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
            <p>Analyzing Game #{gameNumber}...</p>
            <p className="single-game-subtext">AI coach reviewing your moves...</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse markdown bold text
  const parseTextWithFormatting = (text) => {
    const parts = []
    let currentIndex = 0
    const formatRegex = /\*\*([^*]+)\*\*/g
    let match

    while ((match = formatRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index))
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>)
      currentIndex = match.index + match[0].length
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Format the analysis text
  const formatAnalysis = (text) => {
    const lines = text.split('\n')
    const elements = []
    let listItems = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="single-game-list">
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
            <ul key={`list-${index}`} className="single-game-list">
              {listItems}
            </ul>
          )
          listItems = []
        }

        const headerText = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
        elements.push(
          <h3 key={`header-${index}`} className="single-game-header">
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
            <ul key={`list-${index}`} className="single-game-list">
              {listItems}
            </ul>
          )
          listItems = []
        }
        elements.push(
          <p key={`para-${index}`} className="single-game-paragraph">
            {parseTextWithFormatting(trimmedLine)}
          </p>
        )
      }
    })

    if (listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="single-game-list">
          {listItems}
        </ul>
      )
    }

    return elements
  }

  return (
    <div className="single-game-overlay">
      <div className="single-game-container">
        <button className="single-game-close" onClick={onClose}>
          ✕
        </button>
        <div className="single-game-header-section">
          <h2 className="single-game-title">Game #{gameNumber} Analysis</h2>
          <p className="single-game-subtitle">AI Coach Review</p>
        </div>
        <div className="single-game-content">
          {formatAnalysis(analysis)}
        </div>
      </div>
    </div>
  )
}

export default SingleGameAnalysis
