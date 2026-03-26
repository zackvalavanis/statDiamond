import type { LiveGame } from "../../types/types"
import { useLocation, useParams } from 'react-router-dom'
import './LiveGamePage.css'

export function LiveGamePage() {
  const location = useLocation()
  const { gameId } = useParams()
  const game = location.state?.game as LiveGame

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
        <div>{game.id}</div>
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
      </div>
    </div>
  )
}