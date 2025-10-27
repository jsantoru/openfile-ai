import './GameViewer.css'

function GameViewer({ gameUrl, onClose }) {
  if (!gameUrl) return null

  // Convert regular Chess.com URL to embed URL
  // From: https://www.chess.com/game/live/143836499762
  // To: https://www.chess.com/emb/game/live/143836499762
  const getEmbedUrl = (url) => {
    if (!url) return null

    // Extract the path after chess.com
    const match = url.match(/chess\.com\/game\/(live|daily)\/(\d+)/)
    if (match) {
      const [, gameType, gameId] = match
      return `https://www.chess.com/emb/game/${gameType}/${gameId}`
    }

    // If already an embed URL or can't parse, return as-is
    return url
  }

  const embedUrl = getEmbedUrl(gameUrl)

  const handleOverlayClick = (e) => {
    // Close if clicking the overlay (not the iframe container)
    if (e.target.className === 'game-viewer-overlay') {
      onClose()
    }
  }

  return (
    <div className="game-viewer-overlay" onClick={handleOverlayClick}>
      <div className="game-viewer-container">
        <button className="game-viewer-close" onClick={onClose}>
          ✕
        </button>
        <iframe
          src={embedUrl}
          className="game-viewer-iframe"
          title="Chess Game"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default GameViewer
