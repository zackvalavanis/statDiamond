# MLB Stats Dashboard - MVP Plan

## Project Overview
A comprehensive MLB statistics dashboard that integrates with an external MLB stats API. Users can search players, follow teams, compare stats, view live scores, and track standings.

**Purpose:** Practice full-stack development with API integration + portfolio piece

**Tech Stack:** FastAPI (Python) backend + React TypeScript frontend + PostgreSQL

---

## 1. CORE FEATURES (MVP - Version 1)

### Must-Have Features:
- ✅ **Player Search & Stats** - Search any MLB player, view their season stats
- ✅ **Team Dashboard** - View team stats, roster, standings
- ✅ **Standings** - Show division/league standings
- ✅ **User Accounts** - Save favorite teams/players
- ✅ **Responsive Design** - Mobile-friendly interface

### Nice-to-Have (Post-MVP):
- 📊 **Player Comparison** - Side-by-side stat comparison (2-4 players)
- 📈 **Historical Trends** - Charts showing player performance over time
- 📅 **Schedule View** - Full season schedule for teams
- 📜 **Game History** - View completed game results for teams
- 🎯 **Advanced Filters** - Filter by position, team, stat thresholds
- 💾 **Saved Searches** - Save common player/team searches
- 🏆 **Awards Tracker** - MVP/Cy Young race leaderboards

---

## 2. USER STORIES

### Authentication & Personalization
- **As a user**, I want to create an account so I can save my favorite teams and players
- **As a user**, I want to log in so I can access my personalized dashboard
- **As a user**, I want to add favorite teams so I can quickly access their stats

### Player Features
- **As a fan**, I want to search for any MLB player by name so I can view their stats
- **As a fan**, I want to see a player's batting/pitching stats for the current season
- **As a fan**, I want to see a player's team, position, and biographical info
- **As a fan**, I want to compare multiple players side-by-side (post-MVP)

### Team Features
- **As a fan**, I want to view my favorite team's current record and standing
- **As a fan**, I want to see my team's roster with player stats
- **As a fan**, I want to see my team's recent game results (post-MVP)
- **As a fan**, I want to see my team's upcoming schedule (post-MVP)

### Standings
- **As a fan**, I want to view division standings for all teams
- **As a fan**, I want to see playoff standings during postseason
- **As a fan**, I want to see team records and games behind leader

---

## 3. DATA MODEL

### User (Your Database)
```
User {
  id: UUID (primary key)
  email: string (unique)
  password: string (hashed)
  name: string
  created_at: timestamp
}
```

### FavoriteTeam (Your Database)
```
FavoriteTeam {
  id: UUID (primary key)
  user_id: UUID (foreign key → User)
  team_id: string (MLB team ID from API)
  team_name: string
  created_at: timestamp
}
```

### FavoritePlayer (Your Database)
```
FavoritePlayer {
  id: UUID (primary key)
  user_id: UUID (foreign key → User)
  player_id: string (MLB player ID from API)
  player_name: string
  created_at: timestamp
}
```

### API Data (Not Stored - Fetched from MLB API)
```
Player {
  id: string
  name: string
  team: string
  position: string
  jersey_number: int
  age: int
  stats: {
    batting: { avg, hr, rbi, obp, slg, ops, ... }
    pitching: { era, wins, losses, strikeouts, whip, ... }
  }
}

Team {
  id: string
  name: string
  abbreviation: string
  division: string
  record: { wins, losses, win_pct }
  stats: { runs_scored, runs_allowed, ... }
}

Standings {
  division: string
  teams: [{ team, wins, losses, gb, streak, ... }]
}
```

---

## 4. TECH STACK (CONFIRMED)

### Frontend
**React + TypeScript** ✅
- Modern, type-safe development
- Component library: shadcn/ui or MUI
- State management: React Context or Zustand
- Charts: Recharts or Chart.js
- **Key packages:**
  - `axios` - API calls
  - `react-router-dom` - Routing
  - `react-query` or `swr` - Data fetching & caching
  - `recharts` - Stats visualizations
  - `tailwindcss` - Styling
  - `date-fns` - Date formatting

### Backend
**Python + FastAPI** ✅
- Acts as a proxy to the MLB API
- Handles authentication
- Caches API responses for performance
- **Key packages:**
  - `fastapi` - Web framework
  - `uvicorn` - ASGI server
  - `sqlalchemy` - ORM for user data
  - `alembic` - Database migrations
  - `python-jose[cryptography]` - JWT tokens
  - `passlib[bcrypt]` - Password hashing
  - `httpx` - HTTP client for MLB API calls
  - `redis` - Caching (optional but recommended)

### Database
**PostgreSQL** ✅
- Store user accounts, favorites, preferences
- MLB data comes from API (not stored except for caching)

### External API
**MLB Stats API** (or your chosen API)
- Your backend will make requests to this API
- Cache responses to avoid rate limits
- Handle API errors gracefully

### Hosting
- **Frontend:** Vercel (free, automatic deploys)
- **Backend:** Railway or Render (free tier)
- **Database:** Neon or Railway (free PostgreSQL)
- **Cache:** Redis Cloud (free tier) or Railway Redis

---

## 4.1 PROJECT STRUCTURE

### Backend (FastAPI)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration (API keys, DB URL)
│   ├── database.py                # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User model
│   │   ├── favorite_team.py       # FavoriteTeam model
│   │   └── favorite_player.py     # FavoritePlayer model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # User Pydantic schemas
│   │   ├── auth.py                # Login/Token schemas
│   │   ├── favorites.py           # Favorites schemas
│   │   ├── player.py              # Player response schemas
│   │   ├── team.py                # Team response schemas
│   │   └── game.py                # Game/Scores schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                # /api/auth/* endpoints
│   │   ├── players.py             # /api/players/* endpoints
│   │   ├── teams.py               # /api/teams/* endpoints
│   │   ├── standings.py           # /api/standings/* endpoints
│   │   └── favorites.py           # /api/favorites/* endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py        # JWT & password logic
│   │   ├── mlb_api_service.py     # MLB API client wrapper
│   │   └── cache_service.py       # Redis caching logic
│   └── dependencies.py            # Shared dependencies
├── alembic/                       # Database migrations
├── tests/
├── requirements.txt
├── .env
└── README.md
```

### Frontend (React + TypeScript)
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── Player/
│   │   │   ├── PlayerSearch.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayerStats.tsx
│   │   │   └── PlayerComparison.tsx (post-MVP)
│   │   ├── Team/
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamRoster.tsx
│   │   │   ├── TeamStats.tsx
│   │   │   └── TeamSchedule.tsx (post-MVP)
│   │   ├── Standings/
│   │   │   ├── StandingsTable.tsx
│   │   │   └── DivisionStandings.tsx
│   │   ├── Dashboard/
│   │   │   ├── UserDashboard.tsx
│   │   │   └── FavoritesSection.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Navbar.tsx
│   │       └── Layout.tsx
│   ├── services/
│   │   └── api.ts                 # Axios instance & API calls
│   ├── types/
│   │   ├── user.ts
│   │   ├── player.ts
│   │   ├── team.ts
│   │   └── standings.ts
│   ├── hooks/
│   │   ├── useAuth.tsx
│   │   ├── usePlayers.tsx
│   │   ├── useTeams.tsx
│   │   └── useFavorites.tsx
│   ├── pages/
│   │   ├── HomePage.tsx           # Standings + favorites overview
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx      # User's personalized view
│   │   ├── PlayerSearchPage.tsx
│   │   ├── PlayerDetailPage.tsx
│   │   ├── TeamDetailPage.tsx
│   │   ├── StandingsPage.tsx
│   │   └── ComparePage.tsx (post-MVP)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. API ENDPOINTS (YOUR BACKEND)

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user info

### Players
- `GET /api/players/search?q={name}` - Search players by name
- `GET /api/players/{player_id}` - Get player details and stats
- `GET /api/players/{player_id}/stats?season={year}` - Get stats for specific season

### Teams
- `GET /api/teams` - Get all MLB teams
- `GET /api/teams/{team_id}` - Get team details
- `GET /api/teams/{team_id}/roster` - Get team roster
- `GET /api/teams/{team_id}/stats` - Get team stats
- `GET /api/teams/{team_id}/schedule` - Get team schedule (post-MVP)

### Standings
- `GET /api/standings` - Get all divisions standings
- `GET /api/standings/{division}` - Get specific division standings

### Favorites (User-specific)
- `POST /api/favorites/teams` - Add favorite team
- `DELETE /api/favorites/teams/{team_id}` - Remove favorite team
- `GET /api/favorites/teams` - Get user's favorite teams
- `POST /api/favorites/players` - Add favorite player
- `DELETE /api/favorites/players/{player_id}` - Remove favorite player
- `GET /api/favorites/players` - Get user's favorite players

---

## 6. WIREFRAMES / SCREENS

### Screen 1: Home Page (Public)
```
+----------------------------------+
|  MLB Stats Hub    [Login] [Sign Up]  |
+----------------------------------+
|  📊 AL EAST STANDINGS            |
|  1. Yankees    45-30             |
|  2. Orioles    42-33             |
|  3. Rays       40-35             |
+----------------------------------+
|  🔍 [Search Players or Teams]    |
+----------------------------------+
|  Featured Players Today:         |
|  Aaron Judge - .298 / 28 HR      |
|  Shohei Ohtani - .310 / 25 HR    |
+----------------------------------+
```

### Screen 2: Player Search
```
+----------------------------------+
|  Search Players                  |
|  [Aaron Judge_________] [Search] |
+----------------------------------+
|  Results:                        |
|  +---------------------------+   |
|  | Aaron Judge               |   |
|  | NYY • RF • #99            |   |
|  | .298 AVG | 28 HR | 67 RBI |   |
|  | [View Details]            |   |
|  +---------------------------+   |
+----------------------------------+
```

### Screen 3: Player Detail Page
```
+----------------------------------+
|  ← Back                          |
|  Aaron Judge                     |
|  New York Yankees • Right Field  |
|  #99 • 6'7" • 32 years old       |
|  [⭐ Add to Favorites]           |
+----------------------------------+
|  2025 Season Stats               |
|  AVG    OBP    SLG    OPS        |
|  .298   .385   .612   .997       |
|                                  |
|  AB: 275  H: 82  HR: 28  RBI: 67 |
|  BB: 45   K: 68  SB: 5           |
+----------------------------------+
|  📊 [View Stats Chart]           |
+----------------------------------+
```

### Screen 4: Team Detail Page
```
+----------------------------------+
|  ← Back                          |
|  New York Yankees                |
|  AL East • 45-30 (.600)          |
|  [⭐ Add to Favorites]           |
+----------------------------------+
|  Team Stats                      |
|  Runs/Game: 5.2  ERA: 3.45       |
|  Batting Avg: .265               |
+----------------------------------+
|  Top Players                     |
|  Aaron Judge    .298 / 28 HR     |
|  Juan Soto      .315 / 22 HR     |
|  Gerrit Cole    2.89 ERA / 8 W   |
+----------------------------------+
|  [View Full Roster]              |
+----------------------------------+
```

### Screen 5: User Dashboard (Logged In)
```
+----------------------------------+
|  My Dashboard          [Profile] |
+----------------------------------+
|  ⭐ MY FAVORITE TEAMS             |
|  Yankees (45-30) • 1st in AL East|
|  Dodgers (48-27) • 1st in NL West|
+----------------------------------+
|  ⭐ MY FAVORITE PLAYERS           |
|  Aaron Judge    .298 / 28 HR     |
|  Shohei Ohtani  .310 / 25 HR     |
+----------------------------------+
|  📊 STANDINGS OVERVIEW           |
|  AL East: NYY leads by 3.0 GB    |
|  NL West: LAD leads by 5.5 GB    |
+----------------------------------+
```

### Screen 6: Standings Page
```
+----------------------------------+
|  MLB Standings                   |
|  [AL East] [AL Central] [AL West]|
+----------------------------------+
|  American League East            |
|  Team        W    L   PCT   GB   |
|  Yankees     45   30  .600   -   |
|  Orioles     42   33  .560  3.0  |
|  Rays        40   35  .533  5.0  |
|  Blue Jays   38   37  .507  7.0  |
|  Red Sox     35   40  .467 10.0  |
+----------------------------------+
```

---

## 7. DEVELOPMENT PHASES

### **Phase 1: MVP Core (Weeks 1-3)**
**Goal:** Basic working app with essential features

**Backend Tasks:**
1. Set up FastAPI project structure
2. Database setup (User, Favorites tables)
3. User authentication (signup, login, JWT)
4. MLB API service wrapper (create client)
5. Implement player search endpoint
6. Implement team endpoints
7. Implement standings endpoint
8. Implement favorites CRUD endpoints
9. Add basic caching (optional but recommended)

**Frontend Tasks:**
1. Set up React + TypeScript + Tailwind
2. Create authentication pages (login/signup)
3. Create home page with standings overview
4. Create player search functionality
5. Create player detail page
6. Create team detail page
7. Create standings page
8. Create user dashboard
9. Implement favorites functionality
10. Responsive design for mobile

**Definition of Done:**
- Users can sign up and log in
- Users can search for players and view stats
- Users can view team details
- Users can see standings
- Users can save favorite teams/players
- App is mobile-friendly
- Deployed to production

---

### **Phase 2: Polish & UX (Week 4)**
**Goal:** Make it professional and portfolio-ready

**Tasks:**
1. Improve UI/UX design (consistent styling, better layouts)
2. Add loading states and skeletons
3. Add error handling and user-friendly error messages
4. Add search suggestions/autocomplete
5. Optimize performance (lazy loading, code splitting)
6. Add animations and transitions
7. Write comprehensive README with screenshots
8. Add "About" page explaining the project
9. Improve mobile UX

**Definition of Done:**
- Professional-looking UI
- Smooth user experience
- No obvious bugs
- Great README for portfolio

---

### **Phase 3: Advanced Features (Weeks 5-6+)**
**Goal:** Stand-out features

**Tasks:**
1. **Player Comparison Tool**
   - Side-by-side stat comparison (2-4 players)
   - Visual charts comparing key stats
2. **Historical Stats Charts**
   - Line charts showing player performance over time
   - Season-by-season trends
3. **Advanced Filtering**
   - Filter players by position, team, stat thresholds
   - Sort by different stat categories
4. **Team Schedule View**
   - Full season schedule
   - Filter by month/opponent
5. **Notifications (if time)**
   - Email alerts for favorite team games
   - Game start notifications
6. **Advanced Stats**
   - WAR, wOBA, FIP for advanced users
   - Sabermetrics dashboard

---

## 8. FASTAPI CODE EXAMPLES

### MLB API Service (Core Integration)
```python
# app/services/mlb_api_service.py
import httpx
from typing import Optional, List, Dict, Any
from app.config import settings

class MLBAPIService:
    def __init__(self):
        self.base_url = settings.MLB_API_BASE_URL
        self.api_key = settings.MLB_API_KEY  # If required
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def search_players(self, query: str) -> List[Dict[str, Any]]:
        """Search for players by name"""
        # Adjust endpoint based on your specific API
        response = await self.client.get(
            f"{self.base_url}/players/search",
            params={"name": query, "season": 2025}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_player_stats(self, player_id: str, season: int = 2025) -> Dict[str, Any]:
        """Get player statistics for a season"""
        response = await self.client.get(
            f"{self.base_url}/players/{player_id}/stats",
            params={"season": season}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_team_info(self, team_id: str) -> Dict[str, Any]:
        """Get team information and current stats"""
        response = await self.client.get(f"{self.base_url}/teams/{team_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_standings(self, division: Optional[str] = None) -> Dict[str, Any]:
        """Get standings for all divisions or specific division"""
        params = {"season": 2025}
        if division:
            params["division"] = division
        
        response = await self.client.get(
            f"{self.base_url}/standings",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Singleton instance
mlb_api = MLBAPIService()
```

### Players Router
```python
# app/routers/players.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.services.mlb_api_service import mlb_api
from app.schemas.player import PlayerSearchResult, PlayerDetail
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("/search", response_model=List[PlayerSearchResult])
async def search_players(q: str):
    """Search for players by name"""
    try:
        results = await mlb_api.search_players(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching players: {str(e)}")

@router.get("/{player_id}", response_model=PlayerDetail)
async def get_player_detail(player_id: str, season: int = 2025):
    """Get detailed player information and stats"""
    try:
        player_data = await mlb_api.get_player_stats(player_id, season)
        return player_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching player: {str(e)}")
```

### Favorites Router
```python
# app/routers/favorites.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.favorite_team import FavoriteTeam
from app.models.favorite_player import FavoritePlayer
from app.schemas.favorites import FavoriteTeamCreate, FavoritePlayerCreate

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/teams")
async def add_favorite_team(
    favorite: FavoriteTeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a team to user's favorites"""
    # Check if already favorited
    existing = db.query(FavoriteTeam).filter(
        FavoriteTeam.user_id == current_user.id,
        FavoriteTeam.team_id == favorite.team_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Team already in favorites")
    
    new_favorite = FavoriteTeam(
        user_id=current_user.id,
        team_id=favorite.team_id,
        team_name=favorite.team_name
    )
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return new_favorite

@router.get("/teams")
async def get_favorite_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's favorite teams"""
    favorites = db.query(FavoriteTeam).filter(
        FavoriteTeam.user_id == current_user.id
    ).all()
    return favorites

@router.delete("/teams/{team_id}")
async def remove_favorite_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a team from favorites"""
    favorite = db.query(FavoriteTeam).filter(
        FavoriteTeam.user_id == current_user.id,
        FavoriteTeam.team_id == team_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    return {"message": "Favorite removed"}
```

### Caching Service (Optional but Recommended)
```python
# app/services/cache_service.py
import json
from typing import Optional, Any
from redis import Redis
from app.config import settings

class CacheService:
    def __init__(self):
        self.redis = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """Set value in cache with TTL (default 5 minutes)"""
        self.redis.setex(key, ttl, json.dumps(value))
    
    def delete(self, key: str):
        """Delete key from cache"""
        self.redis.delete(key)

cache = CacheService()

# Usage in MLB API service:
async def get_player_stats_cached(self, player_id: str, season: int = 2025):
    cache_key = f"player:{player_id}:stats:{season}"
    
    # Try cache first
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # Fetch from API
    data = await self.get_player_stats(player_id, season)
    
    # Cache for 5 minutes
    cache.set(cache_key, data, ttl=300)
    return data
```

### TypeScript Types & API Service
```typescript
// src/types/player.ts
export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  jerseyNumber: number;
  age: number;
  height: string;
  weight: number;
}

export interface BattingStats {
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  stolenBases: number;
}

export interface PitchingStats {
  era: number;
  wins: number;
  losses: number;
  saves: number;
  inningsPitched: number;
  strikeouts: number;
  walks: number;
  whip: number;
  hits: number;
  earnedRuns: number;
}

export interface PlayerDetail extends Player {
  battingStats?: BattingStats;
  pitchingStats?: PitchingStats;
}

// src/services/api.ts
import axios from 'axios';
import type { PlayerDetail, Team, Game, Standings } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Players
export const searchPlayers = async (query: string) => {
  const response = await api.get(`/api/players/search`, { params: { q: query } });
  return response.data;
};

export const getPlayerDetail = async (playerId: string): Promise<PlayerDetail> => {
  const response = await api.get(`/api/players/${playerId}`);
  return response.data;
};

// Teams
export const getTeamDetail = async (teamId: string) => {
  const response = await api.get(`/api/teams/${teamId}`);
  return response.data;
};

export const getTeamRoster = async (teamId: string) => {
  const response = await api.get(`/api/teams/${teamId}/roster`);
  return response.data;
};

// Standings
export const getStandings = async (division?: string) => {
  const response = await api.get('/api/standings', { params: { division } });
  return response.data;
};

// Favorites
export const addFavoriteTeam = async (teamId: string, teamName: string) => {
  const response = await api.post('/api/favorites/teams', { team_id: teamId, team_name: teamName });
  return response.data;
};

export const getFavoriteTeams = async () => {
  const response = await api.get('/api/favorites/teams');
  return response.data;
};

export const removeFavoriteTeam = async (teamId: string) => {
  const response = await api.delete(`/api/favorites/teams/${teamId}`);
  return response.data;
};

export default api;
```

---

## 9. KEY TECHNICAL CONSIDERATIONS

### API Rate Limiting
- Most MLB APIs have rate limits
- **Solution:** Implement caching (Redis) to reduce API calls
- Cache player stats for 5-10 minutes
- Cache team data for 10-15 minutes
- Cache standings for 30-60 minutes

### Error Handling
- MLB API might be down or slow
- **Solution:** 
  - Implement retry logic with exponential backoff
  - Show user-friendly error messages
  - Have fallback UI for when data isn't available

### Search Performance
- Player search should be fast
- **Solution:**
  - Debounce search input (wait 300ms after typing stops)
  - Show loading states
  - Cache search results

### Mobile Performance
- Stats tables can be wide
- **Solution:**
  - Make tables horizontally scrollable
  - Show condensed stats on mobile
  - Use cards instead of tables on small screens

---

## 10. SUCCESS METRICS

### For Personal Use:
- ✅ Can quickly find any player's stats
- ✅ Live scores update reliably
- ✅ Favorites save and load correctly

### For Portfolio:
- ✅ Clean, professional UI
- ✅ Fast and responsive
- ✅ Handles API errors gracefully
- ✅ Shows full-stack skills (API integration, backend, frontend, database)
- ✅ Comprehensive README with screenshots
- ✅ Deployed and publicly accessible

---

## 11. POTENTIAL CHALLENGES & SOLUTIONS

### Challenge 1: API Integration
**Problem:** Learning a new API structure, handling edge cases
**Solution:** Read API docs thoroughly, test endpoints in Postman first, handle null/missing data

### Challenge 2: Data Inconsistencies
**Problem:** API data might have different formats for different endpoints
**Solution:** Create adapter/transformer functions to normalize data into your schemas

### Challenge 3: Performance with Large Data
**Problem:** Loading full rosters or many players at once
**Solution:** Implement pagination, lazy loading, and data caching

---

## NEXT STEPS

1. ✅ **Choose and test your MLB API** (make sample requests in Postman)
2. ✅ **Set up GitHub repos** (backend and frontend)
3. ✅ **Set up backend** (FastAPI + PostgreSQL + MLB API client)
4. ✅ **Build authentication** (signup/login with JWT)
5. ✅ **Integrate MLB API** (create service wrapper, test endpoints)
6. ✅ **Build core features** (player search, team view, live scores)
7. ✅ **Build frontend** (React components, routing, API integration)
8. ✅ **Add favorites** (user-specific saved teams/players)
9. ✅ **Deploy MVP**
10. ✅ **Polish and add advanced features**

---

## TIMELINE ESTIMATE

- **Week 1:** Setup + Auth + MLB API integration (10-15 hours)
- **Week 2:** Core features (players, teams, scores, standings) (15-20 hours)
- **Week 3:** Frontend + Favorites + Testing (10-15 hours)
- **Week 4:** Polish, UX improvements, deployment (8-10 hours)
- **Week 5-6+:** Advanced features (comparison, charts) (15-20 hours)

**Total MVP Time:** ~35-50 hours
**Total with Advanced Features:** ~50-70 hours

---

## PORTFOLIO PRESENTATION TIPS

When showing this project:
1. **Live demo** - Search for a popular player, show their stats and team info
2. **Explain API integration** - "I integrated the [API name] to fetch real-time MLB data"
3. **Highlight caching** - "Implemented Redis caching to optimize API calls and improve performance"
4. **Show personalization** - "Users can save favorite teams and players for quick access"
5. **Discuss challenges** - "Handling rate limits and data inconsistencies was interesting..."
6. **Show code quality** - Clean architecture, type safety with TypeScript
7. **Emphasize full-stack** - "Built both the frontend and backend, handling auth, data persistence, and external API integration"

---

## RESOURCES

### Learning Resources:
- FastAPI docs: https://fastapi.tiangolo.com
- React Query (for data fetching): https://tanstack.com/query
- Recharts (for visualizations): https://recharts.org

### Design Inspiration:
- ESPN: https://www.espn.com/mlb
- MLB.com: https://www.mlb.com
- Baseball Reference: https://www.baseball-reference.com
- TheScore app (mobile design reference)

### MLB Stats APIs:
- MLB Stats API (official): https://statsapi.mlb.com/docs/
- MySportsFeeds: https://www.mysportsfeeds.com
- SportsData.io: https://sportsdata.io
- ESPN API (undocumented but used by many)

---

**Ready to build a comprehensive MLB stats dashboard! 🚀⚾**
