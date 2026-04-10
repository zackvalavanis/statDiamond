import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import type { Roster } from '../../types/types'
import './TeamDetails.css'

const MLB_TEAM_CAP_IDS: Record<string, number> = {
  'Arizona Diamondbacks': 109,
  'Atlanta Braves': 144,
  'Baltimore Orioles': 110,
  'Boston Red Sox': 111,
  'Chicago Cubs': 112,
  'Chicago White Sox': 145,
  'Cincinnati Reds': 113,
  'Cleveland Guardians': 114,
  'Colorado Rockies': 115,
  'Detroit Tigers': 116,
  'Houston Astros': 117,
  'Kansas City Royals': 118,
  'Los Angeles Angels': 108,
  'Los Angeles Dodgers': 119,
  'Miami Marlins': 146,
  'Milwaukee Brewers': 158,
  'Minnesota Twins': 142,
  'New York Mets': 121,
  'New York Yankees': 147,
  'Oakland Athletics': 133,
  'Philadelphia Phillies': 143,
  'Pittsburgh Pirates': 134,
  'San Diego Padres': 135,
  'San Francisco Giants': 137,
  'Seattle Mariners': 136,
  'St. Louis Cardinals': 138,
  'Tampa Bay Rays': 139,
  'Texas Rangers': 140,
  'Toronto Blue Jays': 141,
  'Washington Nationals': 120
}

const ID_TO_TEAM: Record<number, string> = Object.fromEntries(
  Object.entries(MLB_TEAM_CAP_IDS).map(([k, v]) => [v, k])
)

export function TeamDetails() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const api = import.meta.env.VITE_API_URL

  const [roster, setRoster] = useState<Roster[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const teamName = useMemo(() => {
    if (!teamId) return ''
    const decoded = decodeURIComponent(teamId)
    if (!isNaN(Number(decoded))) return ID_TO_TEAM[Number(decoded)] ?? ''
    return decoded
  }, [teamId])

  const teamCapId = MLB_TEAM_CAP_IDS[teamName] ?? 0

  useEffect(() => {
    if (!teamName) return

    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${api}/api/teams/${encodeURIComponent(teamName)}/roster?season=2026`,
          { signal: controller.signal }
        )

        const data = await res.json()

        if (!res.ok) throw new Error(data?.detail || 'Failed request')
        if (!Array.isArray(data)) throw new Error('Bad data format')

        setRoster(data)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setRoster([])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [teamName, api])

  const hitters = useMemo(
    () => roster.filter(p => p.player_type === 'hitter'),
    [roster]
  )

  const pitchers = useMemo(
    () => roster.filter(p => p.player_type === 'pitcher'),
    [roster]
  )

  const goToPlayer = (p: Roster) => {
    if (!p.key_mlbam) return
    navigate(`/player/${p.key_mlbam}`, { state: { player: p } })
  }

  return (
    <div className="team-page">
      {/* HEADER */}
      <div className="team-header">
        {/* <h1>{teamName}</h1> */}

        {teamCapId > 0 && (
          <img
            src={`https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamCapId}.svg`}
            alt={teamName}
            className="team-logo"
          />
        )}
      </div>

      {loading && <p className="status">Loading roster...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && roster.length === 0 && (
        <p className="status">No roster data found.</p>
      )}

      {/* ================= HITTERS ================= */}
      {!loading && !error && hitters.length > 0 && (
        <div className="table-section">
          <h2>Hitters</h2>

          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>POS</th>
                <th>AB</th>
                <th>H</th>
                <th>HR</th>
                <th>RBI</th>
                <th>AVG</th>
                <th>OBP</th>
                <th>SLG</th>
              </tr>
            </thead>

            <tbody>
              {hitters.map((p, index) => (
                <tr key={p.key_mlbam} onClick={() => goToPlayer(p)} style={{ cursor: 'pointer' }}>
                  <td>{index + 1}</td>
                  <td className="name">{p.Name}</td>
                  <td>{p.Position}</td>
                  <td>{p.AB ?? 0}</td>
                  <td>{p.H ?? 0}</td>
                  <td>{p.HR ?? 0}</td>
                  <td>{p.RBI ?? 0}</td>
                  <td>{typeof p.AVG === 'number' ? p.AVG.toFixed(3) : '.000'}</td>
                  <td>{typeof p.OBP === 'number' ? p.OBP.toFixed(3) : '.000'}</td>
                  <td>{typeof p.SLG === 'number' ? p.SLG.toFixed(3) : '.000'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= PITCHERS ================= */}
      {!loading && !error && pitchers.length > 0 && (
        <div className="table-section">
          <h2>Pitchers</h2>

          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>IP</th>
                <th>ERA</th>
                <th>SO</th>
                <th>BB</th>
                <th>W</th>
                <th>L</th>
                <th>WHIP</th>
              </tr>
            </thead>

            <tbody>
              {pitchers.map((p, index) => (
                <tr key={p.key_mlbam} onClick={() => goToPlayer(p)} style={{ cursor: 'pointer' }}>
                  <td>{index + 1}</td>
                  <td className="name">{p.Name}</td>
                  <td>{typeof p.IP === 'number' ? p.IP.toFixed(1) : '0.0'}</td>
                  <td>{typeof p.ERA === 'number' ? p.ERA.toFixed(2) : '0.00'}</td>
                  <td>{p.SO ?? 0}</td>
                  <td>{p.BB ?? 0}</td>
                  <td>{p.W ?? 0}</td>
                  <td>{p.L ?? 0}</td>
                  <td>{typeof p.WHIP === 'number' ? p.WHIP.toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}