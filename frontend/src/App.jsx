import { useState } from 'react'
import GameHistory from './components/GameHistory'
import GameAnalysis from './components/GameAnalysis'
import SingleGameAnalysis from './components/SingleGameAnalysis'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [archives, setArchives] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingGames, setLoadingGames] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [singleGameAnalysis, setSingleGameAnalysis] = useState(null)
  const [loadingSingleGame, setLoadingSingleGame] = useState(false)
  const [analyzingGameNumber, setAnalyzingGameNumber] = useState(null)
  const [error, setError] = useState(null)

  const fetchArchives = async () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError(null)
    setArchives(null)
    setGames(null)
    setSelectedMonth(null)

    try {
      const response = await fetch(`http://localhost:8000/api/archives/${username}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch archives: ${response.statusText}`)
      }

      const data = await response.json()
      setArchives(data.archives)
    } catch (err) {
      setError(err.message || 'Failed to fetch archives')
      console.error('Error fetching archives:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGamesForMonth = async (archiveUrl) => {
    setLoadingGames(true)
    setError(null)
    setGames(null)
    setAnalysis(null)
    setSelectedMonth(archiveUrl)

    try {
      // Extract year and month from URL
      // URL format: https://api.chess.com/pub/player/{username}/games/{year}/{month}
      const urlParts = archiveUrl.split('/')
      const year = urlParts[urlParts.length - 2]
      const month = urlParts[urlParts.length - 1]

      const response = await fetch(`http://localhost:8000/api/games/${username}/${year}/${month}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`)
      }

      const data = await response.json()
      setGames(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch games')
      console.error('Error fetching games:', err)
    } finally {
      setLoadingGames(false)
    }
  }

  const analyzeGames = async () => {
    if (!games || !games.games || games.games.length === 0) {
      setError('No games to analyze')
      return
    }

    setLoadingAnalysis(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          games: games.games
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to analyze games: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze games')
      console.error('Error analyzing games:', err)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchArchives()
  }

  const formatArchiveDate = (archiveUrl) => {
    const urlParts = archiveUrl.split('/')
    const year = urlParts[urlParts.length - 2]
    const month = urlParts[urlParts.length - 1]
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const openGameViewer = (url) => {
    // Chess.com doesn't allow iframe embedding, so open in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const analyzeSingleGame = async (game, gameNumber) => {
    setLoadingSingleGame(true)
    setAnalyzingGameNumber(gameNumber)
    setSingleGameAnalysis(null)

    try {
      const response = await fetch('http://localhost:8000/api/analyze-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          game: game
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to analyze game: ${response.statusText}`)
      }

      const data = await response.json()
      setSingleGameAnalysis(data.analysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze game')
      console.error('Error analyzing game:', err)
      setLoadingSingleGame(false)
      setAnalyzingGameNumber(null)
    } finally {
      setLoadingSingleGame(false)
    }
  }

  const closeSingleGameAnalysis = () => {
    setSingleGameAnalysis(null)
    setAnalyzingGameNumber(null)
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">
            Chess.com Game Analyzer
          </h1>
          <p className="subtitle">
            Enter your Chess.com username to view your game history
          </p>
        </div>

        <div className="search-form-container">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Chess.com username"
              className="search-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <span className="loading-content">
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
                  Loading...
                </span>
              ) : (
                'Find Archives'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        )}

        {archives && archives.length > 0 && (
          <div className="archives-container">
            <h2 className="archives-title">Select a Month</h2>
            <div className="archives-grid">
              {archives.slice().reverse().map((archive) => (
                <button
                  key={archive}
                  onClick={() => fetchGamesForMonth(archive)}
                  disabled={loadingGames}
                  className={`archive-button ${selectedMonth === archive ? 'selected' : ''}`}
                >
                  {formatArchiveDate(archive)}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingGames && (
          <div className="loading-games">
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
            <p>Loading games...</p>
          </div>
        )}

        {games && (
          <>
            <div className="analyze-section">
              <button
                onClick={analyzeGames}
                disabled={loadingAnalysis}
                className="analyze-button"
              >
                {loadingAnalysis ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>

            <GameAnalysis analysis={analysis} loading={loadingAnalysis} onGameClick={openGameViewer} />

            <GameHistory data={games} onGameClick={openGameViewer} onAnalyzeClick={analyzeSingleGame} />
          </>
        )}
      </div>

      <SingleGameAnalysis
        analysis={singleGameAnalysis}
        loading={loadingSingleGame}
        gameNumber={analyzingGameNumber}
        onClose={closeSingleGameAnalysis}
      />
    </div>
  )
}

export default App
