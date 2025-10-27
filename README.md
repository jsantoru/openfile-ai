# Chess.com Game Analyzer

A modern web application to analyze your Chess.com game history with personalized feedback and insights.

## Features

- Fetch game history from Chess.com using their public API
- View games with detailed information (ratings, results, openings)
- Filter games by time control (bullet, blitz, rapid, etc.)
- Modern, responsive UI with dark theme
- Fast and efficient data fetching

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **httpx** - Async HTTP client for API calls
- **Pydantic** - Data validation and serialization

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

```
openfile-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── services/
│   │   └── chess_api.py     # Chess.com API integration
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── App.jsx          # Main App component
    │   └── main.jsx         # Entry point
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   python main.py
   ```

   Or use uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Enter your Chess.com username
4. Click "Fetch Games" to load your game history
5. Browse and filter your games by time control

## API Endpoints

### `GET /`
Health check endpoint

### `POST /api/games/{username}`
Fetch game history for a user

**Parameters:**
- `username` (path): Chess.com username
- `limit_months` (query, optional): Number of recent months to fetch (default: 12)

**Response:**
```json
{
  "username": "player123",
  "total_games": 150,
  "games": [...]
}
```

### `GET /api/archives/{username}`
Get list of available game archives

## Future Enhancements

- Game analysis using Stockfish engine
- Opening repertoire analysis
- Mistake pattern detection
- Performance trends over time
- Position-type weaknesses identification
- Personalized improvement recommendations

## Chess.com API

This project uses the [Chess.com Public API](https://www.chess.com/news/view/published-data-api) to fetch game data. No authentication is required for accessing public game data.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
