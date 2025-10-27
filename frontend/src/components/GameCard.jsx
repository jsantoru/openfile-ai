function GameCard({ game, username }) {
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

  const resultColor = isWin
    ? 'bg-green-500/20 border-green-500/50 text-green-300'
    : isDraw
    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
    : 'bg-red-500/20 border-red-500/50 text-red-300'

  return (
    <a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105 cursor-pointer"
    >
      {/* Result Badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 border ${resultColor}`}>
        {isWin ? 'Win' : isDraw ? 'Draw' : 'Loss'}
      </div>

      {/* Players */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${isWhite ? 'bg-white' : 'bg-gray-800 border-2 border-white'}`} />
            <span className="text-white font-semibold truncate">{username}</span>
          </div>
          <span className="text-gray-300 font-mono">{playerRating}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${!isWhite ? 'bg-white' : 'bg-gray-800 border-2 border-white'}`} />
            <span className="text-gray-300 truncate">{opponentUsername}</span>
          </div>
          <span className="text-gray-400 font-mono">{opponentRating}</span>
        </div>
      </div>

      {/* Game Info */}
      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Time Control</span>
          <span className="text-gray-300 capitalize">{game.time_class}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Date</span>
          <span className="text-gray-300">{date}</span>
        </div>
        {game.eco && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Opening</span>
            <span className="text-gray-300 font-mono">{game.eco}</span>
          </div>
        )}
      </div>
    </a>
  )
}

export default GameCard
