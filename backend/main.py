from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.chess_api import ChessComAPIService
from services.openai_service import OpenAIAnalysisService
from models import GameHistoryResponse, UserRequest
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

# Initialize OpenAI service (will be None if API key not set)
try:
    openai_service = OpenAIAnalysisService()
    logger.info("OpenAI service initialized successfully")
except Exception as e:
    openai_service = None
    logger.warning(f"OpenAI service not available: {e}")


class AnalysisRequest(BaseModel):
    username: str
    games: List[Dict[str, Any]]


@app.get("/")
async def root():
    return {"message": "Chess.com Game Analyzer API", "status": "running"}


@app.get("/api/archives/{username}")
async def get_user_archives(username: str):
    """Get list of available game archives for a user."""
    try:
        archives = await chess_service.fetch_archives(username)
        return {"username": username, "archives": archives}
    except Exception as e:
        logger.error(f"Error fetching archives for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/games/{username}/{year}/{month}", response_model=GameHistoryResponse)
async def get_month_games(username: str, year: int, month: int):
    """
    Fetch games for a specific month.

    Args:
        username: Chess.com username
        year: Year (e.g., 2025)
        month: Month (1-12)

    Returns:
        GameHistoryResponse with games and metadata
    """
    try:
        logger.info(f"Fetching games for {username} - {year}/{month}")
        archive_url = f"https://api.chess.com/pub/player/{username}/games/{year}/{month:02d}"
        games_data = await chess_service.fetch_month_games(archive_url)

        games = []
        for game_data in games_data:
            try:
                game = chess_service._parse_game(game_data, username)
                games.append(game)
            except Exception as e:
                logger.warning(f"Failed to parse game: {e}")
                continue

        return GameHistoryResponse(
            username=username,
            total_games=len(games),
            games=games
        )
    except Exception as e:
        logger.error(f"Error fetching games for {username} {year}/{month}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def analyze_games(request: AnalysisRequest):
    """
    Analyze games using OpenAI to identify recurring mistakes and provide actionable advice.

    Args:
        request: Contains username and list of games

    Returns:
        Analysis text with insights and recommendations
    """
    if not openai_service:
        raise HTTPException(
            status_code=503,
            detail="OpenAI service not available. Please set OPENAI_API_KEY environment variable."
        )

    try:
        logger.info(f"Analyzing {len(request.games)} games for {request.username}")
        analysis = openai_service.analyze_games(request.games, request.username)
        return {"analysis": analysis}
    except Exception as e:
        logger.error(f"Error analyzing games: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class SingleGameAnalysisRequest(BaseModel):
    username: str
    game: Dict[str, Any]


@app.post("/api/analyze-game")
async def analyze_single_game(request: SingleGameAnalysisRequest):
    """
    Analyze a single game using OpenAI to provide detailed coaching feedback.

    Args:
        request: Contains username and single game data

    Returns:
        Analysis text with move-by-move insights
    """
    if not openai_service:
        raise HTTPException(
            status_code=503,
            detail="OpenAI service not available. Please set OPENAI_API_KEY environment variable."
        )

    try:
        logger.info(f"Analyzing single game for {request.username}")
        analysis = openai_service.analyze_single_game(request.game, request.username)
        return {"analysis": analysis}
    except Exception as e:
        logger.error(f"Error analyzing game: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
