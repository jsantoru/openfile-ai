import { useState } from 'react'
import GameCard from './GameCard'
import './GameHistory.css'

function GameHistory({ data }) {
  const [filter, setFilter] = useState('all')

  if (!data || !data.games || data.games.length === 0) {
    return (
      <div className="no-games">
        <p className="no-games-text">No games found</p>
      </div>
    )
  }

  const filteredGames = data.games.filter((game) => {
    if (filter === 'all') return true
    return game.time_class === filter
  })

  const timeClasses = [...new Set(data.games.map((g) => g.time_class))]

  return (
    <div className="game-history-container">
      <div className="stats-header">
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-label">Username</p>
            <p className="stat-value">{data.username}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total Games</p>
            <p className="stat-value">{data.total_games}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Filtered</p>
            <p className="stat-value">{filteredGames.length}</p>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <button
          onClick={() => setFilter('all')}
          className={`filter-button ${filter === 'all' ? 'active' : 'inactive'}`}
        >
          All
        </button>
        {timeClasses.map((tc) => (
          <button
            key={tc}
            onClick={() => setFilter(tc)}
            className={`filter-button ${filter === tc ? 'active' : 'inactive'}`}
          >
            {tc}
          </button>
        ))}
      </div>

      <div className="games-grid">
        {filteredGames.map((game, index) => (
          <GameCard key={index} game={game} username={data.username} />
        ))}
      </div>
    </div>
  )
}

export default GameHistory
