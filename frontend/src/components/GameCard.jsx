import './GameCard.css'

function GameCard({ game, username, gameNumber, onGameClick, onAnalyzeClick }) {
  const isWhite = game.white_username.toLowerCase() === username.toLowerCase()
  const playerColor = isWhite ? 'white' : 'black'
  const opponentColor = isWhite ? 'black' : 'white'

  const playerRating = isWhite ? game.white_rating : game.black_rating
  const opponentRating = isWhite ? game.black_rating : game.white_rating
  const opponentUsername = isWhite ? game.black_username : game.white_username

  const playerResult = isWhite ? game.white_result : game.black_result
  const isWin = playerResult === 'win'
  const isDraw = playerResult.includes('draw') || playerResult === 'stalemate'
  const isLoss = !isWin && !isDraw

  const date = new Date(game.end_time * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const resultClass = isWin ? 'win' : isDraw ? 'draw' : 'loss'

  // Parse opening from URL
  const parseOpening = (ecoUrl) => {
    if (!ecoUrl) return null

    // Extract the part after '/openings/'
    const parts = ecoUrl.split('/openings/')
    if (parts.length < 2) return null

    // Get the opening name and replace hyphens with spaces
    const openingText = parts[1].replace(/-/g, ' ')

    // Split into words to identify main opening vs variation
    const words = openingText.split(' ')

    // Common variation keywords
    const variationKeywords = ['Variation', 'Defense', 'Attack', 'Gambit', 'System', 'Line', 'Accepted', 'Declined']

    // Find where the variation starts
    let variationStartIndex = -1
    for (let i = 0; i < words.length; i++) {
      if (variationKeywords.includes(words[i])) {
        // Find the start of this section (look backwards for start)
        variationStartIndex = i
        // Look backwards to find where this phrase starts
        while (variationStartIndex > 0 && !variationKeywords.includes(words[variationStartIndex - 1])) {
          variationStartIndex--
        }
        break
      }
    }

    if (variationStartIndex > 0) {
      const mainOpening = words.slice(0, variationStartIndex).join(' ')
      const variation = words.slice(variationStartIndex).join(' ')
      return { main: mainOpening, variation: variation }
    }

    return { main: openingText, variation: null }
  }

  const opening = parseOpening(game.eco)

  const handleClick = (e) => {
    // Don't open game if clicking the analyze button
    if (e.target.closest('.game-analyze-button')) {
      return
    }
    if (onGameClick) {
      onGameClick(game.url)
    }
  }

  const handleAnalyzeClick = (e) => {
    e.stopPropagation()
    if (onAnalyzeClick) {
      onAnalyzeClick(game, gameNumber)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="game-card"
    >
      <div className="game-card-header">
        <div className={`result-badge ${resultClass}`}>
          {isWin ? 'Win' : isDraw ? 'Draw' : 'Loss'}
        </div>
        <div className="header-right">
          <button className="game-analyze-button" onClick={handleAnalyzeClick} title="Analyze this game with AI">
            🤖 Analyze
          </button>
          {gameNumber && (
            <div className="game-number">
              Game #{gameNumber}
            </div>
          )}
        </div>
      </div>

      <div className="players-section">
        <div className="player-row">
          <div className="player-info">
            <div className={`color-indicator ${isWhite ? 'white' : 'black'}`} />
            <span className="username">{username}</span>
          </div>
          <span className="rating">{playerRating}</span>
        </div>

        <div className="player-row">
          <div className="player-info">
            <div className={`color-indicator ${!isWhite ? 'white' : 'black'}`} />
            <span className="username opponent">{opponentUsername}</span>
          </div>
          <span className="rating opponent">{opponentRating}</span>
        </div>
      </div>

      <div className="game-info">
        <div className="info-row">
          <span className="info-label">Time Control</span>
          <span className="info-value">{game.time_class}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Date</span>
          <span className="info-value">{date}</span>
        </div>
        {opening && (
          <div className="info-row opening-row">
            <span className="info-label">Opening</span>
            <div className="opening-info">
              <span className="opening-main">{opening.main}</span>
              {opening.variation && (
                <span className="opening-variation">{opening.variation}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameCard
