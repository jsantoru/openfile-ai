import { useState } from 'react'
import GameCard from './GameCard'

function GameHistory({ data }) {
  const [filter, setFilter] = useState('all')

  if (!data || !data.games || data.games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No games found</p>
      </div>
    )
  }

  const filteredGames = data.games.filter((game) => {
    if (filter === 'all') return true
    return game.time_class === filter
  })

  const timeClasses = [...new Set(data.games.map((g) => g.time_class))]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Username</p>
            <p className="text-white text-2xl font-bold">{data.username}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Games</p>
            <p className="text-white text-2xl font-bold">{data.total_games}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Filtered</p>
            <p className="text-white text-2xl font-bold">{filteredGames.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          All
        </button>
        {timeClasses.map((tc) => (
          <button
            key={tc}
            onClick={() => setFilter(tc)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === tc
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {tc}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, index) => (
          <GameCard key={index} game={game} username={data.username} />
        ))}
      </div>
    </div>
  )
}

export default GameHistory
