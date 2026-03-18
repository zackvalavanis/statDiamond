import './Teams.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';

interface StandingsRow {
  Tm: string;
  W: string;
  L: string;
  'W-L%': string;
  GB: string;
  league: string;
  division: string;
}

const seasons = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 2025 - i)

export function Teams() {
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [season, setSeason] = useState<number>(2025)
  const api = import.meta.env.VITE_API_URL

  useEffect(() => {
    const handleFetchStandings = async () => {
      try {
        const res = await fetch(`${api}/api/standings?season=${season}`)
        const data: StandingsRow[] = await res.json()

        console.log('API response:', data)
        if (Array.isArray(data)) {
          setStandings(data)
        } else {
          console.error('Expected array, got:', typeof data)
          setStandings([])  // Set to empty array
        }
      } catch (error) {
        console.log(error)
        setStandings([])  // Set to empty array on error
      }
    }
    handleFetchStandings()
  }, [season])

  // Group by league, then by division
  const leagues: Record<string, Record<string, StandingsRow[]>> = {}
  standings.forEach(row => {
    if (!leagues[row.league]) leagues[row.league] = {}
    if (!leagues[row.league][row.division]) leagues[row.league][row.division] = []
    leagues[row.league][row.division].push(row)
  })

  return (
    <div className="teams-page">
      <div className="season-selector">
        <label htmlFor="season-select">Season</label>
        <select
          id="season-select"
          className="select-season"
          onChange={(e) => setSeason(Number(e.target.value))}
          value={season}
        >
          {seasons.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>
      <div className="leagues-container">
        {Object.entries(leagues).map(([league, divs]) => (
          <div className="division-container" key={league}>
            <h1>{league}</h1>
            {Object.entries(divs).map(([divName, teams]) => (
              <div className="division" key={divName}>
                <h2>{divName}</h2>
                <table className="division-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>PCT</th>
                      <th>GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teams]
                      .sort((a, b) => {
                        const aGB = a.GB === '--' ? 0 : parseFloat(a.GB ?? '999')
                        const bGB = b.GB === '--' ? 0 : parseFloat(b.GB ?? '999')
                        return aGB - bGB
                      })
                      .map((team) => {
                        return (
                          < tr key={team.Tm} >
                            <td>
                              <Link to={`/teams/${team.Tm}`}>{team.Tm}</Link>
                            </td>
                            <td>{team.W}</td>
                            <td>{team.L}</td>
                            <td>{team['W-L%']}</td>
                            <td>{team.GB}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div >
  )
}