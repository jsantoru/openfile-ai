import httpx
import logging
from typing import List, Dict, Any
from models import ChessGame

logger = logging.getLogger(__name__)


class ChessComAPIService:
    """Service for interacting with Chess.com Public API"""

    BASE_URL = "https://api.chess.com/pub"

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "ChessGameAnalyzer/1.0"}
        )

    async def fetch_archives(self, username: str) -> List[str]:
        """
        Fetch list of available game archives for a user.

        Args:
            username: Chess.com username

        Returns:
            List of archive URLs
        """
        url = f"{self.BASE_URL}/player/{username}/games/archives"
        logger.info(f"Fetching archives from: {url}")

        try:
            response = await self.client.get(url)
            response.raise_for_status()
            data = response.json()
            return data.get("archives", [])
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"User '{username}' not found on Chess.com")
            raise Exception(f"HTTP error occurred: {e}")
        except Exception as e:
            raise Exception(f"Error fetching archives: {e}")

    async def fetch_month_games(self, archive_url: str) -> List[Dict[str, Any]]:
        """
        Fetch games from a specific monthly archive.

        Args:
            archive_url: URL to monthly archive

        Returns:
            List of game dictionaries
        """
        logger.info(f"Fetching games from archive: {archive_url}")

        try:
            response = await self.client.get(archive_url)
            response.raise_for_status()
            data = response.json()
            return data.get("games", [])
        except Exception as e:
            logger.error(f"Error fetching games from {archive_url}: {e}")
            return []

    async def fetch_user_games(self, username: str, limit_months: int = 12) -> List[ChessGame]:
        """
        Fetch recent games for a user.

        Args:
            username: Chess.com username
            limit_months: Number of recent months to fetch

        Returns:
            List of ChessGame objects
        """
        # Get list of archives
        archives = await self.fetch_archives(username)

        if not archives:
            raise ValueError(f"No games found for user '{username}'")

        # Get most recent archives (limited by limit_months)
        recent_archives = archives[-limit_months:] if len(archives) > limit_months else archives
        logger.info(f"Fetching {len(recent_archives)} months of games for {username}")

        # Fetch games from each archive
        all_games = []
        for archive_url in recent_archives:
            games_data = await self.fetch_month_games(archive_url)

            for game_data in games_data:
                try:
                    # Parse game data into ChessGame model
                    game = self._parse_game(game_data, username)
                    all_games.append(game)
                except Exception as e:
                    logger.warning(f"Failed to parse game: {e}")
                    continue

        logger.info(f"Successfully fetched {len(all_games)} games for {username}")
        return all_games

    def _parse_game(self, game_data: Dict[str, Any], username: str) -> ChessGame:
        """Parse raw game data into ChessGame model"""
        white = game_data.get("white", {})
        black = game_data.get("black", {})

        return ChessGame(
            url=game_data.get("url", ""),
            pgn=game_data.get("pgn", ""),
            time_control=game_data.get("time_control", ""),
            end_time=game_data.get("end_time", 0),
            rated=game_data.get("rated", False),
            time_class=game_data.get("time_class", ""),
            rules=game_data.get("rules", "chess"),
            white_username=white.get("username", ""),
            white_rating=white.get("rating", 0),
            white_result=white.get("result", ""),
            black_username=black.get("username", ""),
            black_rating=black.get("rating", 0),
            black_result=black.get("result", ""),
            eco=game_data.get("eco"),
        )

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
