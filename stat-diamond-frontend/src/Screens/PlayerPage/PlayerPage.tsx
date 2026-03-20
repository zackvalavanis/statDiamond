import './PlayerPage.css'
import type { Player } from '../../types/types'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { PlayerSplit } from '../../types/types'


export function PlayerPage() {
  const location = useLocation()
  const player = location.state?.player as Player
  const [yearlyStats, setYearlyStats] = useState<PlayerSplit[]>([])
  // const [salary, setSalary] = useState('')
  // const first_letter = (player.Name[0])
  const api = import.meta.env.VITE_API_URL
  // const [playerIds, setPlayerIds] = useState<{ key_mlbam: number, key_bbref: string } | null>(null)

  const mlbStats = yearlyStats.filter((split) => split.team)

  const totals = mlbStats.reduce(
    (acc, split) => ({
      gamesPlayed: acc.gamesPlayed + split.stat.gamesPlayed,
      atBats: acc.atBats + split.stat.atBats,
      hits: acc.hits + split.stat.hits,
      homeRuns: acc.homeRuns + split.stat.homeRuns,
      runs: acc.runs + split.stat.runs,
      rbi: acc.rbi + split.stat.rbi,
      stolenBases: acc.stolenBases + split.stat.stolenBases,
      baseOnBalls: acc.baseOnBalls + split.stat.baseOnBalls,
      strikeOuts: acc.strikeOuts + split.stat.strikeOuts,
      doubles: acc.doubles + split.stat.doubles,
      triples: acc.triples + split.stat.triples,
    }),
    { gamesPlayed: 0, atBats: 0, hits: 0, homeRuns: 0, runs: 0, rbi: 0, stolenBases: 0, baseOnBalls: 0, strikeOuts: 0, doubles: 0, triples: 0 }
  )

  const totalAvg = totals.atBats > 0 ? (totals.hits / totals.atBats).toFixed(3) : '.000'
  const totalObp = totals.atBats > 0
    ? ((totals.hits + totals.baseOnBalls) / (totals.atBats + totals.baseOnBalls)).toFixed(3)
    : '.000'

  const totalTB = mlbStats.reduce((acc, split) => {
    const singles = split.stat.hits - split.stat.doubles - split.stat.triples - split.stat.homeRuns
    return acc + singles + (split.stat.doubles * 2) + (split.stat.triples * 3) + (split.stat.homeRuns * 4)
  }, 0)

  const totalSlg = totals.atBats > 0 ? (totalTB / totals.atBats).toFixed(3) : '.000'
  const totalOps = totals.atBats > 0 ? (parseFloat(totalObp) + parseFloat(totalSlg)).toFixed(3) : '.000'


  console.log(player.key_mlbam)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${player.key_mlbam}/stats?stats=yearByYear&group=hitting`)
        const data = await res.json()
        console.log(data);
        const splits = data.stats?.[0]?.splits || []
        console.log("splits:", splits)
        setYearlyStats(splits)
      } catch (error) {
        console.log(error)
      }
    }

    // const fetchPlayerIds = async () => {
    //   try {
    //     const res = await fetch(`${api}/api/stats/player/${encodeURIComponent(player.Name)}/ids`)
    //     const ids = await res.json()
    //     setPlayerIds(ids)
    //     console.log('Baseball Reference ID:', ids.key_bbref)

    //     // RIGHT HERE - after we have the bbref ID
    //     if (ids.key_bbref) {
    //       fetchSalary(ids.key_bbref)  // ← Calls fetchSalary with the ID
    //     }
    //   } catch (error) {
    //     console.error('Error fetching IDs:', error)
    //   }
    // }

    // const fetchSalary = async (key_bbref: string) => {
    //   try {
    //     const first_letter = player.Name[0].toLowerCase()
    //     const res = await fetch(`https://www.baseball-reference.com/players/${first_letter}/${key_bbref}.shtml`)
    //     const data = await res.json()
    //     console.log("Salary data:", data)
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }
    // if (player?.Name) {
    //   fetchPlayerIds()  // This will call fetchSalary after getting IDs
    // }
    fetchStats()
  }, [player?.key_mlbam, player.Name, api])


  return (
    <div className='player-page'>
      <img
        src={`https://midfield.mlbstatic.com/v1/people/${player.key_mlbam}/spots/213`}
        alt={player.Name}
        className="player-headshot"
      />
      {player.Name}
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
              <td>{totals.gamesPlayed}</td>
              <td>{totals.atBats}</td>
              <td>{totals.hits}</td>
              <td>{totals.homeRuns}</td>
              <td>{totals.runs}</td>
              <td>{totals.rbi}</td>
              <td>{totals.stolenBases}</td>
              <td>{totals.baseOnBalls}</td>
              <td>{totals.strikeOuts}</td>
              <td>{totalAvg}</td>
              <td>{totalObp}</td>
              <td>{totalSlg}</td>
              <td>{totalOps}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}