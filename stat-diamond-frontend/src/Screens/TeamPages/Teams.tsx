import './Teams.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';

const teamNameToAbbr: Record<string, string> = {
  'Chicago Cubs': 'CHC',
  'Cincinnati Reds': 'CIN',
  'Milwaukee Brewers': 'MIL',
  'Pittsburgh Pirates': 'PIT',
  'St. Louis Cardinals': 'STL',
  'Arizona Diamondbacks': 'ARI',
  'Colorado Rockies': 'COL',
  'Los Angeles Dodgers': 'LAD',
  'San Diego Padres': 'SDP',
  'San Francisco Giants': 'SFG',
  'Atlanta Braves': 'ATL',
  'Miami Marlins': 'MIA',
  'New York Mets': 'NYM',
  'Philadelphia Phillies': 'PHI',
  'Washington Nationals': 'WSN',
  'Chicago White Sox': 'CHW',
  'Cleveland Guardians': 'CLE',
  'Detroit Tigers': 'DET',
  'Kansas City Royals': 'KCR',
  'Minnesota Twins': 'MIN',
  'Houston Astros': 'HOU',
  'Los Angeles Angels': 'LAA',
  'Athletics': 'OAK',
  'Seattle Mariners': 'SEA',
  'Texas Rangers': 'TEX',
  'Baltimore Orioles': 'BAL',
  'Boston Red Sox': 'BOS',
  'New York Yankees': 'NYY',
  'Tampa Bay Rays': 'TBR',
  'Toronto Blue Jays': 'TOR',
}

interface StandingsRow {
  Tm: string;
  W: string;
  L: string;
  'W-L%': string;
  GB: string;
}

const divisions = {
  'National League': {
    'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
    'NL West': ['ARI', 'COL', 'LAD', 'SDP', 'SFG'],
    'NL East': ['ATL', 'MIA', 'NYM', 'PHI', 'WSN'],
  },
  'American League': {
    'AL Central': [
      { abbr: 'CHW', display: 'CWS' },
      'CLE', 'DET', 'KCR', 'MIN',
    ],
    'AL West': ['HOU', 'LAA', 'OAK', 'SEA', 'TEX'],
    'AL East': ['BAL', 'BOS', 'NYY', 'TBR', 'TOR'],
  },
}

function getTeam(team: string | { abbr: string; display: string }) {
  if (typeof team === 'string') return { abbr: team, display: team }
  return team
}

export function Teams() {
  const [standings, setStandings] = useState<Record<string, StandingsRow>>({});

  useEffect(() => {
    const handleFetchStandings = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/standings?season=2025")
        const data: StandingsRow[] = await res.json()
        const lookup: Record<string, StandingsRow> = {}
        data.forEach(row => {
          const abbr = teamNameToAbbr[row.Tm]
          if (abbr) lookup[abbr] = row
        })
        setStandings(lookup)
      } catch (error) {
        console.log(error)
      }
    }
    handleFetchStandings()
  }, [])

  return (
    <div className="leagues-container">
      {Object.entries(divisions).map(([league, divs]) => (
        <div className="division-container" key={league}>
          <h1>{league}</h1>
          {Object.entries(divs).map(([divName, teams]) => (
            <div className="division" key={divName}>
              <h2>{divName}</h2>
              <table className="division-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Home</th>
                    <th>Away</th>
                    <th>GB</th>
                  </tr>
                </thead>
                <tbody>
                  {[...teams]
                    .sort((a, b) => {
                      const aStats = standings[getTeam(a).abbr]
                      const bStats = standings[getTeam(b).abbr]
                      const aGB = aStats?.GB === '--' ? 0 : parseFloat(aStats?.GB ?? '999')
                      const bGB = bStats?.GB === '--' ? 0 : parseFloat(bStats?.GB ?? '999')
                      return aGB - bGB
                    })
                    .map((team) => {
                      const { abbr, display } = getTeam(team)
                      const stats = standings[abbr]
                      return (
                        <tr key={abbr}>
                          <td>
                            <Link to={`/teams/${abbr}`}>{display}</Link>
                          </td>
                          <td>{stats?.W ?? '—'}</td>
                          <td>{stats?.L ?? '—'}</td>
                          <td>—</td>
                          <td>—</td>
                          <td>{stats?.GB ?? '—'}</td>
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
  )
}