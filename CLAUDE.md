# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chess.com Game Analyzer - A full-stack web application that fetches and displays Chess.com game history with filtering capabilities. The project uses FastAPI for the backend and React with Vite for the frontend.

## Development Commands

### Backend (FastAPI)
```bash
# From backend/ directory
cd backend

# Activate virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Unix/Mac

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# or
uvicorn main:app --reload

# API runs at http://localhost:8000
```

### Frontend (React + Vite)
```bash
# From frontend/ directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Dev server runs at http://localhost:5173

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Backend Structure
- **main.py** - FastAPI application entry point with CORS middleware and route definitions
- **models.py** - Pydantic data models (ChessGame, GameHistoryResponse, UserRequest)
- **services/chess_api.py** - ChessComAPIService class that handles all Chess.com Public API interactions
  - `fetch_archives()` - Gets list of monthly game archives for a user
  - `fetch_month_games()` - Fetches games from a specific monthly archive
  - `fetch_user_games()` - Main method that orchestrates fetching recent games (default: 12 months)
  - `_parse_game()` - Parses raw Chess.com API response into ChessGame model

### Frontend Structure
- **App.jsx** - Main component handling username input, API calls to backend, loading/error states
- **components/GameHistory.jsx** - Displays game statistics and filter buttons, manages time control filtering
- **components/GameCard.jsx** - Individual game card showing player colors/ratings, result (win/loss/draw), date, time control, and ECO opening code

### API Integration Flow
1. User enters Chess.com username in React frontend
2. Frontend makes POST request to `/api/games/{username}` on backend
3. Backend service fetches user's monthly archives from Chess.com Public API
4. Backend fetches games from most recent N months (configurable, default 12)
5. Games are parsed into ChessGame models and returned to frontend
6. Frontend displays games with filtering by time class (bullet, blitz, rapid, daily)

### Key Data Models
- **ChessGame**: Includes url, pgn, time_control, end_time, rated, time_class, rules, player usernames/ratings/results, and optional ECO code
- **GameHistoryResponse**: Contains username, total_games count, and list of ChessGame objects

### CORS Configuration
Backend allows requests from `http://localhost:5173` (Vite default) and `http://localhost:3000`

## Key Dependencies
- Backend: FastAPI, uvicorn, httpx (async HTTP), pydantic
- Frontend: React 19, Tailwind CSS, Vite
