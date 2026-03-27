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
  const [boxScore, setBoxScore] = useState<any>(null)
  const [livePlay, setLivePlay] = useState<any>(null)

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

  useEffect(() => {
    const fetchPlayByPlay = async () => {
      try {
        const res = await fetch(`${api}/api/stats/live-games/${gameId}/playbyplay`)
        const data = await res.json()
        setLivePlay(data)
      } catch (error) {
        console.error('Error fetching play by play', error)
      }
    }

    fetchPlayByPlay()

    const interval = setInterval(fetchPlayByPlay, 15000)

    return () => clearInterval(interval)

  }, [gameId, api])


  useEffect(() => {
    const fetchBoxScore = async () => {
      try {
        const res = await fetch(`${api}/api/stats/live-games/${gameId}/boxscore`)
        const data = await res.json();
        setBoxScore(data.teams)
        setLivePlay(data)
      } catch (error) {
        console.error("error fetching boxscore", error);
      }
    }

    fetchBoxScore()

    const interval = setInterval(fetchBoxScore, 15000);
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


      {livePlay?.currentPlay && (
        <div>
          <div className="current_matchup">
            <h3>Current Pitcher</h3>
            <p>{livePlay.currentPlay.matchup.pitcher.fullName} {livePlay.currentPlay.matchup.pitchHand.code}</p>
          </div>

          <div className="current_matchup">
            <h3>Current at Bat</h3>
            <p>{livePlay.currentPlay.matchup.batter.fullName} {livePlay.currentPlay.matchup.batSide.code}</p>
          </div>

          {/* Pitch Sequence */}
          {livePlay.currentPlay.playEvents && (
            <div className="pitch-sequence">
              <h4>Pitches:</h4>
              {livePlay.currentPlay.playEvents
                .filter((event: any) => event.isPitch)
                .map((pitch: any, i: number) => (
                  <span key={i} className="pitch">
                    {pitch.details?.type?.code} {pitch.details?.startSpeed}mph - {pitch.details?.call?.description}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}




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
      <div className='box-score'>
        {boxScore && (
          <>
            <h2>Box Score</h2>

            <div className="boxscore-tables">
              {/* Away Team */}
              <div className="team-boxscore">
                <h3>{boxScore.away.team.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Pos</th>
                      <th>AB</th>
                      <th>R</th>
                      <th>H</th>
                      <th>RBI</th>
                      <th>AVG</th>
                      <th>OBP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...boxScore.away.battingOrder, ...boxScore.away.bench].map((batterId: number, index: number) => {
                      const player = boxScore.away.players[`ID${batterId}`]
                      if (!player) return null
                      return (
                        <tr key={batterId}>
                          <td>{index + 1}</td>
                          <td>{player.person.fullName}</td>
                          <td>{player.position.abbreviation}</td>
                          <td>{player.stats.batting?.atBats || 0}</td>
                          <td>{player.stats.batting?.runs || 0}</td>
                          <td>{player.stats.batting?.hits || 0}</td>
                          <td>{player.stats.batting?.rbi || 0}</td>
                          <td>{player.seasonStats.batting?.avg || 0}</td>
                          <td>{player.seasonStats.batting?.obp || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Home Team */}
              <div className="team-boxscore">
                <h3>{boxScore.home.team.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Pos</th>
                      <th>AB</th>
                      <th>R</th>
                      <th>H</th>
                      <th>RBI</th>
                      <th>AVG</th>
                      <th>OBP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...boxScore.home.battingOrder, ...boxScore.home.bench].map((batterId: number, index: number) => {
                      const player = boxScore.home.players[`ID${batterId}`]
                      if (!player) return null
                      return (
                        <tr key={batterId}>
                          <td>{index + 1}</td>
                          <td>{player.person.fullName}</td>
                          <td>{player.position.abbreviation}</td>
                          <td>{player.stats.batting?.atBats || 0}</td>
                          <td>{player.stats.batting?.runs || 0}</td>
                          <td>{player.stats.batting?.hits || 0}</td>
                          <td>{player.stats.batting?.rbi || 0}</td>
                          <td>{player.seasonStats.batting?.avg || 0}</td>
                          <td>{player.seasonStats.batting?.obp || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>


      {/*Pitching box score*/}






      <div className='box-score'>
        {boxScore && (
          <>
            <h2>Pitching</h2>

            <div className="boxscore-tables">
              {/* Away Team */}
              <div className="team-boxscore">
                <h3>{boxScore.away.team.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Pos</th>
                      <th>IP</th>
                      <th>SO</th>
                      <th>H</th>
                      <th>R</th>
                      <th>ERA</th>

                    </tr>
                  </thead>
                  <tbody>
                    {[...boxScore.away.pitchers, ...boxScore.away.bullpen].map((pitcherId: number, index: number) => {
                      const player = boxScore.away.players[`ID${pitcherId}`]
                      if (!player) return null
                      return (
                        <tr key={pitcherId}>
                          <td>{index + 1}</td>
                          <td>{player.person.fullName}</td>
                          <td>{player.position.abbreviation}</td>
                          <td>{player.stats.pitching?.inningsPitched || ''}</td>
                          <td>{player.stats.pitching?.strikeOuts || 0}</td>
                          <td>{player.stats.pitching?.hits || 0}</td>
                          <td>{player.stats.pitching?.runs || 0}</td>
                          <td>{player.seasonStats?.pitching.era || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Home Team */}
              <div className="team-boxscore">
                <h3>{boxScore.home.team.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Pos</th>
                      <th>IP</th>
                      <th>SO</th>
                      <th>H</th>
                      <th>R</th>
                      <th>ERA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...boxScore.home.pitchers, ...boxScore.home.bullpen].map((pitcherId: number, index: number) => {
                      const player = boxScore.home.players[`ID${pitcherId}`]
                      if (!player) return null
                      return (
                        <tr key={pitcherId}>
                          <td>{index + 1}</td>
                          <td>{player.person.fullName}</td>
                          <td>{player.position.abbreviation}</td>
                          <td>{player.stats.pitching?.inningsPitched || 0}</td>
                          <td>{player.stats.pitching?.strikeOuts || 0}</td>
                          <td>{player.stats.pitching?.hits || 0}</td>
                          <td>{player.stats.pitching?.runs || 0}</td>
                          <td>{player.seasonStats?.pitching.era || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>



    </div>
  )
}