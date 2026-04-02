import './PlayerPage.css'
import type { Player } from '../../types/types'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { PlayerSplit } from '../../types/types'

export function PlayerPage() {
  const location = useLocation()
  const player = location.state?.player as Player
  const [yearlyStats, setYearlyStats] = useState<PlayerSplit[]>([])

  // Fix: isPitcher logic was correct, isHitter was wrong
  const isPitcher = player?.Position === "P" || player?.Position === "SP" || player?.Position === 'RP'

  const mlbStats = yearlyStats.filter((split) => split.team)

  // Batting totals
  const battingTotals = mlbStats.reduce(
    (acc, split) => ({
      gamesPlayed: acc.gamesPlayed + (split.stat.gamesPlayed || 0),
      atBats: acc.atBats + (split.stat.atBats || 0),
      hits: acc.hits + (split.stat.hits || 0),
      homeRuns: acc.homeRuns + (split.stat.homeRuns || 0),
      runs: acc.runs + (split.stat.runs || 0),
      rbi: acc.rbi + (split.stat.rbi || 0),
      stolenBases: acc.stolenBases + (split.stat.stolenBases || 0),
      baseOnBalls: acc.baseOnBalls + (split.stat.baseOnBalls || 0),
      strikeOuts: acc.strikeOuts + (split.stat.strikeOuts || 0),
      doubles: acc.doubles + (split.stat.doubles || 0),
      triples: acc.triples + (split.stat.triples || 0),
    }),
    { gamesPlayed: 0, atBats: 0, hits: 0, homeRuns: 0, runs: 0, rbi: 0, stolenBases: 0, baseOnBalls: 0, strikeOuts: 0, doubles: 0, triples: 0 }
  )

  // Pitching totals
  const pitchingTotals = mlbStats.reduce(
    (acc, split) => ({
      gamesPlayed: acc.gamesPlayed + (split.stat.gamesPlayed || 0),
      wins: acc.wins + (split.stat.wins || 0),
      losses: acc.losses + (split.stat.losses || 0),
      saves: acc.saves + (split.stat.saves || 0),
      inningsPitched: acc.inningsPitched + parseFloat(split.stat.inningsPitched || '0'),
      hits: acc.hits + (split.stat.hits || 0),
      runs: acc.runs + (split.stat.runs || 0),
      earnedRuns: acc.earnedRuns + (split.stat.earnedRuns || 0),
      homeRuns: acc.homeRuns + (split.stat.homeRuns || 0),
      baseOnBalls: acc.baseOnBalls + (split.stat.baseOnBalls || 0),
      strikeOuts: acc.strikeOuts + (split.stat.strikeOuts || 0),
    }),
    { gamesPlayed: 0, wins: 0, losses: 0, saves: 0, inningsPitched: 0, hits: 0, runs: 0, earnedRuns: 0, homeRuns: 0, baseOnBalls: 0, strikeOuts: 0 }
  )

  const totalAvg = battingTotals.atBats > 0 ? (battingTotals.hits / battingTotals.atBats).toFixed(3) : '.000'
  const totalObp = battingTotals.atBats > 0
    ? ((battingTotals.hits + battingTotals.baseOnBalls) / (battingTotals.atBats + battingTotals.baseOnBalls)).toFixed(3)
    : '.000'

  const totalTB = mlbStats.reduce((acc, split) => {
    const singles = (split.stat.hits || 0) - (split.stat.doubles || 0) - (split.stat.triples || 0) - (split.stat.homeRuns || 0)
    return acc + singles + ((split.stat.doubles || 0) * 2) + ((split.stat.triples || 0) * 3) + ((split.stat.homeRuns || 0) * 4)
  }, 0)

  const totalSlg = battingTotals.atBats > 0 ? (totalTB / battingTotals.atBats).toFixed(3) : '.000'
  const totalOps = battingTotals.atBats > 0 ? (parseFloat(totalObp) + parseFloat(totalSlg)).toFixed(3) : '.000'

  const totalERA = pitchingTotals.inningsPitched > 0
    ? ((pitchingTotals.earnedRuns * 9) / pitchingTotals.inningsPitched).toFixed(2)
    : '0.00'
  const totalWHIP = pitchingTotals.inningsPitched > 0
    ? ((pitchingTotals.hits + pitchingTotals.baseOnBalls) / pitchingTotals.inningsPitched).toFixed(2)
    : '0.00'

  useEffect(() => {
    const fetchStats = async () => {
      const mlbId = player?.key_mlbam
      if (!mlbId) {
        console.warn('No MLB ID for player:', player?.Name)
        setYearlyStats([])
        return
      }

      try {
        // Fetch appropriate stats based on position
        const group = isPitcher ? 'pitching' : 'hitting'
        const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${mlbId}/stats?stats=yearByYear&group=${group}`)
        const data = await res.json()
        const splits = data.stats?.[0]?.splits || []
        setYearlyStats(splits)
      } catch (error) {
        console.log(error)
      }
    }

    fetchStats()
  }, [player?.key_mlbam, isPitcher])

  return (
    <div className='player-page'>
      <img
        src={`https://midfield.mlbstatic.com/v1/people/${player.key_mlbam}/spots/213`}
        alt={player.Name}
        className="player-headshot"
      />
      <h1>{player.Name}</h1>
      <h3>{player.Position} - {player.Team}</h3>

      <div className='player-bio'>
        <table className="player-bio-table">
          <thead>
            <tr>
              <th>Salary</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{player.Dol || 'N/A'} M</td>
              <td>{player.Age || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isPitcher ? (
        <table className="yearly-stats-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Team</th>
              <th>G</th>
              <th>W</th>
              <th>L</th>
              <th>SV</th>
              <th>IP</th>
              <th>H</th>
              <th>R</th>
              <th>ER</th>
              <th>HR</th>
              <th>BB</th>
              <th>SO</th>
              <th>ERA</th>
              <th>WHIP</th>
            </tr>
          </thead>
          <tbody>
            {mlbStats.map((split, i) => (
              <tr key={i}>
                <td>{split.season}</td>
                <td>{split.team.name}</td>
                <td>{split.stat.gamesPlayed}</td>
                <td>{split.stat.wins}</td>
                <td>{split.stat.losses}</td>
                <td>{split.stat.saves}</td>
                <td>{split.stat.inningsPitched}</td>
                <td>{split.stat.hits}</td>
                <td>{split.stat.runs}</td>
                <td>{split.stat.earnedRuns}</td>
                <td>{split.stat.homeRuns}</td>
                <td>{split.stat.baseOnBalls}</td>
                <td>{split.stat.strikeOuts}</td>
                <td>{split.stat.era}</td>
                <td>{split.stat.whip}</td>
              </tr>
            ))}
            {mlbStats.length > 0 && (
              <tr className="totals-row">
                <td>Career</td>
                <td>—</td>
                <td>{pitchingTotals.gamesPlayed}</td>
                <td>{pitchingTotals.wins}</td>
                <td>{pitchingTotals.losses}</td>
                <td>{pitchingTotals.saves}</td>
                <td>{pitchingTotals.inningsPitched.toFixed(1)}</td>
                <td>{pitchingTotals.hits}</td>
                <td>{pitchingTotals.runs}</td>
                <td>{pitchingTotals.earnedRuns}</td>
                <td>{pitchingTotals.homeRuns}</td>
                <td>{pitchingTotals.baseOnBalls}</td>
                <td>{pitchingTotals.strikeOuts}</td>
                <td>{totalERA}</td>
                <td>{totalWHIP}</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <table className="yearly-stats-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Team</th>
              <th>G</th>
              <th>AB</th>
              <th>H</th>
              <th>HR</th>
              <th>R</th>
              <th>RBI</th>
              <th>SB</th>
              <th>BB</th>
              <th>SO</th>
              <th>AVG</th>
              <th>OBP</th>
              <th>SLG</th>
              <th>OPS</th>
            </tr>
          </thead>
          <tbody>
            {mlbStats.map((split, i) => (
              <tr key={i}>
                <td>{split.season}</td>
                <td>{split.team.name}</td>
                <td>{split.stat.gamesPlayed}</td>
                <td>{split.stat.atBats}</td>
                <td>{split.stat.hits}</td>
                <td>{split.stat.homeRuns}</td>
                <td>{split.stat.runs}</td>
                <td>{split.stat.rbi}</td>
                <td>{split.stat.stolenBases}</td>
                <td>{split.stat.baseOnBalls}</td>
                <td>{split.stat.strikeOuts}</td>
                <td>{split.stat.avg}</td>
                <td>{split.stat.obp}</td>
                <td>{split.stat.slg}</td>
                <td>{split.stat.ops}</td>
              </tr>
            ))}
            {mlbStats.length > 0 && (
              <tr className="totals-row">
                <td>Career</td>
                <td>—</td>
                <td>{battingTotals.gamesPlayed}</td>
                <td>{battingTotals.atBats}</td>
                <td>{battingTotals.hits}</td>
                <td>{battingTotals.homeRuns}</td>
                <td>{battingTotals.runs}</td>
                <td>{battingTotals.rbi}</td>
                <td>{battingTotals.stolenBases}</td>
                <td>{battingTotals.baseOnBalls}</td>
                <td>{battingTotals.strikeOuts}</td>
                <td>{totalAvg}</td>
                <td>{totalObp}</td>
                <td>{totalSlg}</td>
                <td>{totalOps}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}