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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [boxScore, setBoxScore] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [livePlay, setLivePlay] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState<'away' | 'home'>('away')
  const [currentBatterId, setCurrentBatterId] = useState<number | null>(null)
  const [currentPitcherId, setCurrentPitcherId] = useState<number | null>(null)


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

        if (data?.currentPlay) {
          const newBatterId = data.currentPlay.matchup.batter.id
          const newPitcherId = data.currentPlay.matchup.pitcher.id

          if (newBatterId !== currentBatterId) {
            setCurrentBatterId(newBatterId)
          }
          if (newPitcherId !== currentPitcherId) {
            setCurrentPitcherId(newPitcherId)
          }
        }
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

  // console.log(livePlay?.currentPlay.matchup)
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



      <div className='play-by-play'>

        <div className='play-by-play-left'>
          <div className='play-by-play-history'>
            {livePlay?.allPlays && (
              <div className='pbp-content'>
                {livePlay.allPlays.slice(-10).reverse().map((play: LiveGame, index: number) => {
                  <div key={play.atBatIndex || index} className="play-item">
                    <p><strong>Inning {play.about?.inning}:</strong>{play.result?.description}</p>
                  </div>
                })}


              </div>
            )}

          </div>

        </div>

        <div className='play-by-play-center'>
          <div className='top-middle'>
            <h1>
              Play by Play
            </h1>


          </div>
          {livePlay?.currentPlay && currentBatterId && currentPitcherId && (
            <div className='bottom-middle-information'>
              <div className='batter-vs-pitcher'>
                <p>
                  Pitcher: <strong>{livePlay.currentPlay.matchup.pitcher.fullName}</strong> ({livePlay.currentPlay.matchup.pitchHand.code})
                </p>
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${currentPitcherId}/headshot/67/current`
                  }
                  alt={livePlay.currentPlay.matchup.pitcher.fullname}
                  className="player-headshot"
                />
                <h3>Vs</h3>
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${currentBatterId}/headshot/67/current`
                  }
                  alt={livePlay.currentPlay.matchup.pitcher.fullname}
                  className="player-headshot"
                />
                <p>
                  Batter: <strong>{livePlay.currentPlay.matchup.batter.fullName}</strong> ({livePlay.currentPlay.matchup.batSide.code})
                </p>
              </div>
              <p>
                {/* {livePlay.currentPlay.matchup.} */}
              </p>
            </div>
          )}

        </div>

        <div className='play-by-play-right'>
          <div className='team-toggle'>
            <button
              className={`toggle-btn ${selectedTeam == 'away' ? 'active' : ''}`}
              onClick={() => setSelectedTeam('away')}
            >
              Away
            </button>
            <button
              className={`toggle-btn ${selectedTeam == 'home' ? 'active' : ""}`}
              onClick={() => setSelectedTeam('home')}
            >
              Home
            </button>

            {boxScore && (
              <div className="lineup-content">
                <h3>{boxScore[selectedTeam].team.name}</h3>
                <div className="lineup-list">
                  {[...boxScore[selectedTeam].battingOrder].map((batterId: number, index: number) => {
                    const player = boxScore[selectedTeam].players[`ID${batterId}`]
                    if (!player) return null
                    return (
                      <div key={batterId} className="lineup-item">
                        <span className="lineup-order">{index + 1}</span>
                        <div className="lineup-player">
                          <div className="player-name">{player.person.fullName}</div>
                          <div className="player-pos">{player.position.abbreviation}</div>
                        </div>
                        <div className="player-stats">
                          <span>{player.stats.batting?.hits || 0}-{player.stats.batting?.atBats || 0}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

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