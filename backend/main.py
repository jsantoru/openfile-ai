from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.chess_api import ChessComAPIService
from models import GameHistoryResponse, UserRequest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chess.com Game Analyzer API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chess_service = ChessComAPIService()


@app.get("/")
async def root():
    return {"message": "Chess.com Game Analyzer API", "status": "running"}


@app.post("/api/games/{username}", response_model=GameHistoryResponse)
async def get_user_games(username: str, limit_months: int = 12):
    """
    Fetch game history for a Chess.com user.

    Args:
        username: Chess.com username
        limit_months: Number of recent months to fetch (default: 12)

    Returns:
        GameHistoryResponse with games and metadata
    """
    try:
        logger.info(f"Fetching games for user: {username}")
        games = await chess_service.fetch_user_games(username, limit_months)

        return GameHistoryResponse(
            username=username,
            total_games=len(games),
            games=games
        )
    except Exception as e:
        logger.error(f"Error fetching games for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/archives/{username}")
async def get_user_archives(username: str):
    """Get list of available game archives for a user."""
    try:
        archives = await chess_service.fetch_archives(username)
        return {"username": username, "archives": archives}
    except Exception as e:
        logger.error(f"Error fetching archives for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
