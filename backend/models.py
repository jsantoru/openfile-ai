from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Chess.com username")


class ChessGame(BaseModel):
    """Represents a single chess game from Chess.com"""
    url: str
    pgn: str
    time_control: str
    end_time: int
    rated: bool
    time_class: str  # bullet, blitz, rapid, daily
    rules: str
    white_username: str
    white_rating: int
    white_result: str
    black_username: str
    black_rating: int
    black_result: str
    eco: Optional[str] = None  # Opening ECO code

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://www.chess.com/game/live/12345",
                "time_control": "600",
                "end_time": 1698768000,
                "rated": True,
                "time_class": "rapid",
                "rules": "chess",
                "white_username": "player1",
                "white_rating": 1500,
                "white_result": "win",
                "black_username": "player2",
                "black_rating": 1480,
                "black_result": "checkmated",
            }
        }


class GameHistoryResponse(BaseModel):
    """Response containing user's game history"""
    username: str
    total_games: int
    games: List[ChessGame]
