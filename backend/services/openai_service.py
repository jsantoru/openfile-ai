import os
from openai import OpenAI
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class OpenAIAnalysisService:
    """Service for analyzing chess games using OpenAI"""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.client = OpenAI(api_key=api_key)

    def analyze_games(self, games: List[Dict[str, Any]], username: str) -> str:
        """
        Analyze a collection of games and provide actionable feedback.

        Args:
            games: List of game dictionaries
            username: Username of the player

        Returns:
            Analysis text with actionable insights
        """
        # Prepare game summary
        total_games = len(games)
        wins = sum(1 for g in games if self._is_win(g, username))
        losses = sum(1 for g in games if self._is_loss(g, username))
        draws = total_games - wins - losses

        # Get sample of games with different results
        loss_games = [g for g in games if self._is_loss(g, username)][:8]
        win_games = [g for g in games if self._is_win(g, username)][:3]

        # Build prompt for OpenAI
        prompt = self._build_analysis_prompt(
            username, total_games, wins, losses, draws, loss_games, win_games
        )

        try:
            # First pass: Generate initial analysis
            logger.info("Running first pass analysis...")
            first_response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a dedicated chess coach working one-on-one with a student. Your goal is to identify the ONE MOST IMPORTANT area they need to improve and provide a clear, actionable plan to address it. You review their games carefully, identify patterns in their mistakes, and give specific, concrete advice they can implement immediately. You're encouraging but direct - you care about their improvement above all else. Focus on what will make the biggest difference in their results."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )

            initial_analysis = first_response.choices[0].message.content

            # Second pass: Verify logic and refine analysis
            logger.info("Running second pass for logic verification...")
            verification_prompt = f"""You are reviewing a chess coach's game analysis. Your job is to improve it if needed, then return the COMPLETE FINAL ANALYSIS that will be shown to the student.

Review checklist:
1. Does "THE ONE MAIN THING" section have at least 5 specific game examples?
2. Are the conclusions logically sound based on the statistics?
3. Is the advice actionable and specific?
4. Are there any contradictions or unsupported claims?

ORIGINAL STATISTICS:
- Total Games: {total_games}
- Wins: {wins} ({wins/total_games*100:.1f}%)
- Losses: {losses} ({losses/total_games*100:.1f}%)
- Draws: {draws} ({draws/total_games*100:.1f}%)

ANALYSIS TO REVIEW:
{initial_analysis}

IMPORTANT: Return ONLY the final analysis text that should be shown to the student. Do NOT include meta-commentary like "This analysis is good" or "I verified that...". Just return the complete, polished coaching analysis (with any improvements you made). The student should see the coaching advice directly, not your review notes."""

            second_response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a senior chess coach reviewing another coach's analysis. Verify that the 'ONE MAIN THING' is truly the highest priority issue and the advice is actionable and specific. Ensure all conclusions are backed by the game data. If the analysis is too vague or the priorities seem wrong, revise it to focus on what will actually help this player improve fastest."
                    },
                    {
                        "role": "user",
                        "content": verification_prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent verification
                max_tokens=2200
            )

            return second_response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            raise Exception(f"Failed to analyze games: {str(e)}")

    def _is_win(self, game: Dict[str, Any], username: str) -> bool:
        """Check if player won the game"""
        # Handle flat structure (from ChessGame model)
        if "white_username" in game:
            white_username = game.get("white_username", "")
            black_username = game.get("black_username", "")
            white_result = game.get("white_result", "")
            black_result = game.get("black_result", "")
        # Handle nested structure (from raw Chess.com API)
        else:
            white = game.get("white", {})
            black = game.get("black", {})
            white_username = white.get("username", "")
            black_username = black.get("username", "")
            white_result = white.get("result", "")
            black_result = black.get("result", "")

        if white_username.lower() == username.lower():
            return white_result == "win"
        else:
            return black_result == "win"

    def _is_loss(self, game: Dict[str, Any], username: str) -> bool:
        """Check if player lost the game"""
        # Handle flat structure (from ChessGame model)
        if "white_username" in game:
            white_username = game.get("white_username", "")
            black_username = game.get("black_username", "")
            white_result = game.get("white_result", "")
            black_result = game.get("black_result", "")
        # Handle nested structure (from raw Chess.com API)
        else:
            white = game.get("white", {})
            black = game.get("black", {})
            white_username = white.get("username", "")
            black_username = black.get("username", "")
            white_result = white.get("result", "")
            black_result = black.get("result", "")

        if white_username.lower() == username.lower():
            result = white_result
        else:
            result = black_result

        return result in ["checkmated", "resigned", "timeout", "abandoned", "lose"]

    def _build_analysis_prompt(
        self,
        username: str,
        total: int,
        wins: int,
        losses: int,
        draws: int,
        loss_games: List[Dict],
        win_games: List[Dict]
    ) -> str:
        """Build the analysis prompt for OpenAI"""

        prompt = f"""Analyze these chess games for player "{username}" and identify recurring mistakes with actionable advice.

STATISTICS:
- Total Games: {total}
- Wins: {wins} ({wins/total*100:.1f}%)
- Losses: {losses} ({losses/total*100:.1f}%)
- Draws: {draws} ({draws/total*100:.1f}%)

SAMPLE LOSSES (with detailed move information):
"""

        for i, game in enumerate(loss_games, 1):
            # Handle flat structure
            if "white_username" in game:
                is_white = game.get("white_username", "").lower() == username.lower()
                player_result = game.get("white_result" if is_white else "black_result", "")
                opponent_username = game.get("black_username" if is_white else "white_username", "")
            # Handle nested structure
            else:
                is_white = game.get("white", {}).get("username", "").lower() == username.lower()
                player_result = game.get("white" if is_white else "black", {}).get("result", "")
                opponent_username = game.get("black" if is_white else "white", {}).get("username", "")

            time_class = game.get("time_class", "")
            game_url = game.get("url", "")

            # Extract opening info
            eco = game.get("eco", "")
            opening_name = "Unknown"
            if eco:
                opening_name = eco.split("/openings/")[-1].replace("-", " ") if "/openings/" in eco else "Unknown"

            # Extract move count from PGN
            pgn = game.get("pgn", "")
            move_count = self._extract_move_count(pgn)
            last_moves = self._extract_last_moves(pgn, num_moves=5)

            prompt += f"\n\nGame #{i}:"
            prompt += f"\n  - Time Control: {time_class.capitalize()}"
            prompt += f"\n  - Result: Lost by {player_result}"
            prompt += f"\n  - Playing as: {'White' if is_white else 'Black'}"
            prompt += f"\n  - Opponent: {opponent_username}"
            prompt += f"\n  - Opening: {opening_name}"
            prompt += f"\n  - Total Moves: {move_count}"
            if last_moves:
                prompt += f"\n  - Final Moves: {last_moves}"
            prompt += f"\n  - URL: {game_url}"

        prompt += f"\n\nSAMPLE WINS (for comparison):\n"

        for i, game in enumerate(win_games, 1):
            if "white_username" in game:
                is_white = game.get("white_username", "").lower() == username.lower()
            else:
                is_white = game.get("white", {}).get("username", "").lower() == username.lower()

            time_class = game.get("time_class", "")
            eco = game.get("eco", "")
            opening_name = "Unknown"
            if eco:
                opening_name = eco.split("/openings/")[-1].replace("-", " ") if "/openings/" in eco else "Unknown"

            pgn = game.get("pgn", "")
            move_count = self._extract_move_count(pgn)

            prompt += f"\n\nGame #{i}:"
            prompt += f"\n  - Time Control: {time_class.capitalize()}"
            prompt += f"\n  - Playing as: {'White' if is_white else 'Black'}"
            prompt += f"\n  - Opening: {opening_name}"
            prompt += f"\n  - Total Moves: {move_count}"

        prompt += """

As a chess coach analyzing your student's games, provide your analysis in the following format:

**Games Analyzed**
Start by stating: "Analyzed {total} games: {wins} wins ({win_pct}%), {losses} losses ({loss_pct}%), {draws} draws ({draw_pct}%)"

**🎯 THE ONE MAIN THING TO WORK ON**
This is the MOST IMPORTANT section. As a coach, if you could only give ONE piece of advice that would have the biggest impact on this player's rating and results, what would it be?

Identify the single most critical weakness or pattern holding them back. Then provide:
1. Why this is the #1 priority - YOU MUST provide at least 5 specific game examples (e.g., "Game #2", "Game #5", "Game #8", "Game #12", "Game #15") with brief descriptions of what went wrong in each
2. A specific, step-by-step action plan to address it this week
3. Expected timeline for improvement if they follow the plan
4. How they'll know they've made progress

Be direct and specific. You MUST reference at least 5 specific games in the evidence. This should be your most important coaching advice.

**Additional Patterns & Mistakes**
Identify 2-3 other recurring patterns in the losses (e.g., "losing on time", "weak opening preparation", "tactical oversights in middlegame"). Reference specific Game # examples.

**Concrete Practice Plan**
Based on all the patterns above, provide 3-5 specific daily/weekly practice activities. Be very specific (e.g., "Practice 15 minutes of rook endgame puzzles daily on Chess.com" rather than "study endgames")

**Specific Positions to Review**
List the exact games (by number and URL) that show critical learning moments. Tell them what to look for in each game.

Format your response in a clear, structured way with headers and bullet points. Be encouraging but honest. Focus on what will make the biggest difference. Make sure all conclusions are logically supported by the statistics provided.

IMPORTANT: When providing advice, reference specific games WITH THEIR URLs from the data above. ALWAYS include the game URL when referencing a game. Use this exact format:
- "In [Game #3](URL_HERE), you lost on move 24 - review this position to understand the tactical mistake"
- "[Game #1](URL), [Game #4](URL), and [Game #5](URL) show a pattern of losing in similar opening positions around move 12-15"
- "Check [Game #2](URL) at the final moves - this endgame pattern needs practice"

The URL format should be markdown links: [Game #X](full_game_url). This makes it easy for players to click and review the specific games you're referencing. Use concrete game references with links to make the advice actionable and specific."""

        return prompt

    def _extract_move_count(self, pgn: str) -> int:
        """Extract the total number of moves from PGN"""
        if not pgn:
            return 0

        # Find the last move number in the PGN
        # Moves are in format: 1. e4 e5 2. Nf3 Nc6 etc.
        import re
        moves = re.findall(r'(\d+)\.', pgn)
        return int(moves[-1]) if moves else 0

    def _extract_last_moves(self, pgn: str, num_moves: int = 5) -> str:
        """Extract the last N moves from PGN for context"""
        if not pgn:
            return ""

        # Split PGN into moves section and headers
        import re

        # Remove comments and annotations
        pgn_clean = re.sub(r'\{[^}]*\}', '', pgn)
        pgn_clean = re.sub(r'\[[^\]]*\]', '', pgn_clean)

        # Extract moves (format: 1. e4 e5 2. Nf3)
        moves = re.findall(r'\d+\.\s*\S+(?:\s+\S+)?', pgn_clean)

        if not moves:
            return ""

        # Get last N moves
        last_moves = moves[-num_moves:] if len(moves) >= num_moves else moves
        return ' '.join(last_moves)
