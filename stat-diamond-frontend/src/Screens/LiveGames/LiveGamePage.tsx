import type { LiveGame } from "../../types/types"
import { useLocation, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './LiveGamePage.css'

export function LiveGamePage() {
  const location = useLocation()
  const { gameId } = useParams()
  const initialGame = location.state?.game as LiveGame
  const [game, setGame] = useState<LiveGame | null>(initialGame)
  const api = import.meta.env.VITE_API_URL

  const getInningSymbol = (state: string | null) => {
    if (!state) return ''
    const symbols: Record<string, string> = {
      'Top': '▲',
      'Bottom': '▼',
      'Middle': '◆',
      'End': '■'
    }
    return symbols[state] || ''
  }

  useEffect(() => {
    if (!gameId) return

    const fetchGameData = async () => {
      try {
        const res = await fetch(`${api}/api/stats/live-games`)
        const games = await res.json()
        const updatedGame = games.find((g: LiveGame) => g.game_id.toString() === gameId)
        if (updatedGame) {
          setGame(updatedGame)
        }
      } catch (error) {
        console.error('Error fetching game data:', error)
      }
    }

    // Fetch immediately if we don't have game data
    if (!game) {
      fetchGameData()
    }

    // Set up auto-refresh every 15 seconds
    const interval = setInterval(fetchGameData, 15000)

    return () => clearInterval(interval)
  }, [gameId, api])

  if (!game) {
    return (
      <div className="game-page-loading">
        <div>Loading game data...</div>
      </div>
    )
  }

  return (
    <div className="live-game-page">
      <div className="game-header">
        <div className="game-status">
          <span className={`status-badge status-${game.status.toLowerCase().includes('live') ? 'live' : game.status.toLowerCase().includes('final') ? 'final' : 'scheduled'}`}>
            {game.status}
          </span>
          {game.inning && (
            <span className="inning-info">
              {getInningSymbol(game.inning_state)} {game.inning}
            </span>
          )}
        </div>
        <div className="venue-info">{game.venue}</div>
      </div>

      <div className="scoreboard">
        <div className="team-section away-team">
          <div className="team-header">
            <h2>{game.away_team}</h2>
            <span className="team-record">{game.away_record}</span>
          </div>
          <div className="team-score">{game.away_score}</div>
        </div>

        <div className="score-separator">@</div>

        <div className="team-section home-team">
          <div className="team-header">
            <h2>{game.home_team}</h2>
            <span className="team-record">{game.home_record}</span>
          </div>
          <div className="team-score">{game.home_score}</div>
        </div>
      </div>

      {game.status_code === 'I' && (
        <div className="live-stats">
          <div className="live-indicator-small">
            <div className="live-dot-small"></div>
            Updates every 15s
          </div>
          <div className="count-display">
            <div className="count-item">
              <span className="count-label">Balls</span>
              <span className="count-value">{game.balls ?? '-'}</span>
            </div>
            <div className="count-item">
              <span className="count-label">Strikes</span>
              <span className="count-value">{game.strikes ?? '-'}</span>
            </div>
            <div className="count-item">
              <span className="count-label">Outs</span>
              <span className="count-value">{game.outs ?? '-'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="game-details">
        <div className="detail-item">
          <span className="detail-label">Game Type</span>
          <span className="detail-value">{game.game_type === 'R' ? 'Regular Season' : 'Playoff'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Venue</span>
          <span className="detail-value">{game.venue}</span>
        </div>
      </div>
    </div>
  )
}