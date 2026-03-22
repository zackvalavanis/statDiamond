import './PlayersPage.css'
import { PlayerModal } from './PlayerModal'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Player } from '../../types/types'

const ALL_COLUMNS: { key: keyof Player; label: string; format?: (val: number) => string }[] = [
  { key: 'Name', label: 'Name' },
  { key: 'Position', label: 'POS' },
  { key: 'Age', label: 'Age' },
  { key: 'Team', label: 'Team' },
  { key: 'G', label: 'G' },
  { key: 'AB', label: 'AB' },
  { key: 'PA', label: 'PA' },
  { key: 'H', label: 'H' },
  { key: 'HR', label: 'HR' },
  { key: 'R', label: 'R' },
  { key: 'RBI', label: 'RBI' },
  { key: 'SB', label: 'SB' },
  { key: 'BB%', label: 'BB%' },
  { key: 'K%', label: 'K%' },
  { key: 'AVG', label: 'AVG', format: (v) => v?.toFixed(3) },
  { key: 'OBP', label: 'OBP', format: (v) => v?.toFixed(3) },
  { key: 'SLG', label: 'SLG', format: (v) => v?.toFixed(3) },
  { key: 'OPS', label: 'OPS', format: (v) => v?.toFixed(3) },
  { key: 'WAR', label: 'WAR', format: (v) => v?.toFixed(1) },
]

const DEFAULT_COLUMNS: (keyof Player)[] = ['Name', 'Position', 'Age', 'Team', 'AVG', 'HR']

const teams = [
  { abbr: 'ARI', name: 'Arizona Diamondbacks' },
  { abbr: 'ATL', name: 'Atlanta Braves' },
  { abbr: 'BAL', name: 'Baltimore Orioles' },
  { abbr: 'BOS', name: 'Boston Red Sox' },
  { abbr: 'CHC', name: 'Chicago Cubs' },
  { abbr: 'CHW', name: 'Chicago White Sox' },
  { abbr: 'CIN', name: 'Cincinnati Reds' },
  { abbr: 'CLE', name: 'Cleveland Guardians' },
  { abbr: 'COL', name: 'Colorado Rockies' },
  { abbr: 'DET', name: 'Detroit Tigers' },
  { abbr: 'HOU', name: 'Houston Astros' },
  { abbr: 'KCR', name: 'Kansas City Royals' },
  { abbr: 'LAA', name: 'Los Angeles Angels' },
  { abbr: 'LAD', name: 'Los Angeles Dodgers' },
  { abbr: 'MIA', name: 'Miami Marlins' },
  { abbr: 'MIL', name: 'Milwaukee Brewers' },
  { abbr: 'MIN', name: 'Minnesota Twins' },
  { abbr: 'NYM', name: 'New York Mets' },
  { abbr: 'NYY', name: 'New York Yankees' },
  { abbr: 'OAK', name: 'Oakland Athletics' },
  { abbr: 'PHI', name: 'Philadelphia Phillies' },
  { abbr: 'PIT', name: 'Pittsburgh Pirates' },
  { abbr: 'SDP', name: 'San Diego Padres' },
  { abbr: 'SFG', name: 'San Francisco Giants' },
  { abbr: 'SEA', name: 'Seattle Mariners' },
  { abbr: 'STL', name: 'St. Louis Cardinals' },
  { abbr: 'TBR', name: 'Tampa Bay Rays' },
  { abbr: 'TEX', name: 'Texas Rangers' },
  { abbr: 'TOR', name: 'Toronto Blue Jays' },
  { abbr: 'WSN', name: 'Washington Nationals' },
  { abbr: '- - -', name: 'Free Agent' },
]

const positions = [
  { abbr: 'C', name: 'Catcher' },
  { abbr: '1B', name: 'First Base' },
  { abbr: '2B', name: 'Second Base' },
  { abbr: '3B', name: 'Third Base' },
  { abbr: 'SS', name: 'Shortstop' },
  { abbr: 'LF', name: 'Left Field' },
  { abbr: 'CF', name: 'Center Field' },
  { abbr: 'RF', name: 'Right Field' },
  { abbr: 'DH', name: 'Designated Hitter' },
  { abbr: 'TWP', name: 'Two Way Player' },
]

const seasons = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 2025 - i)

export function PlayersPage() {
  const navigate = useNavigate()
  const [selectedPosition, setSelectedPosition] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [playersPerPage] = useState<number>(25)
  const [players, setPlayers] = useState<Player[]>([])
  const [isModalShowing, setIsModalShowing] = useState<boolean>(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<number>(2025)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [sortKey, setSortKey] = useState<keyof Player>('HR')
  const [ascending, setAscending] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<(keyof Player)[]>(DEFAULT_COLUMNS)
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const api = import.meta.env.VITE_API_URL

  const activeColumns = ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setColumnDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredPlayers = players.filter((p) => {
    const matchesTeam = selectedTeam ? p.Team === selectedTeam : true
    const matchesPosition = selectedPosition ? p.Position === selectedPosition : true
    const matchesSearch = searchQuery ? p.Name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesTeam && matchesPosition && matchesSearch
  })

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let valA = a[sortKey]
    let valB = b[sortKey]

    if (typeof valA === 'number' && typeof valB === 'number') {
      return ascending ? valA - valB : valB - valA
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }

    return 0
  })

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const season = selectedSeason || 2025
        const res = await fetch(
          `${api}/api/stats/player/batting?start=${season}&end=${season}&min_pa=1`
        )
        const data = await res.json()
        setPlayers(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPlayers()
  }, [selectedSeason, api])

  const handleSort = (key: keyof Player) => {
    if (sortKey === key) {
      setAscending(!ascending)
    } else {
      setSortKey(key)
      setAscending(false)
    }
  }

  const toggleColumn = (key: keyof Player) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handlePlayerClick = (player: Player) => {
    navigate(`/player/${player.IDfg}`, { state: { player } })
  }

  const indexOfLastPlayer = currentPage * playersPerPage
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
  const currentPlayers = sortedPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer)
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTeam, selectedSeason, selectedPosition, searchQuery])

  return (
    <div className="players-page">
      <div className="players-filters">
        <div className="filter-group">
          <label htmlFor="team-select">Team</label>
          <select
            id="team-select"
            onChange={(e) => setSelectedTeam(e.target.value)}
            value={selectedTeam}
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.abbr} value={team.abbr}>
                {team.name}
              </option>
            ))}
          </select>
          <select
            id="position-select"
            onChange={(e) => setSelectedPosition(e.target.value)}
            value={selectedPosition}
          >
            <option value="">Pos</option>
            {positions.map((pos) => (
              <option key={pos.abbr} value={pos.abbr}>
                {pos.name}
              </option>
            ))}
          </select>
          <input
            className='search-players'
            type='text'
            placeholder='Search Players...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="season-select">Season</label>
          <select
            id="season-select"
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            value={selectedSeason}
          >
            {seasons.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group column-picker" ref={dropdownRef}>
          <label>Columns</label>
          <button
            className="column-picker-toggle"
            onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
          >
            {visibleColumns.length} selected
          </button>
          {columnDropdownOpen && (
            <div className="column-picker-dropdown">
              {ALL_COLUMNS.map((col) => (
                <label key={col.key} className="column-option">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
          <div>
            <button onClick={() => setVisibleColumns(DEFAULT_COLUMNS)}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="players-table-container">
        <table className="players-table">
          <thead>
            <tr>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`player-headers ${sortKey === col.key ? 'sort-active' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-indicator">{ascending ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPlayers.length > 0 ? (
              currentPlayers.map((player) => (
                <tr
                  className="players-container"
                  key={`${player.IDfg}-${player.Season}`}
                  onClick={() => handlePlayerClick(player)}
                  style={{ cursor: 'pointer' }}
                >
                  {activeColumns.map((col) => (
                    <td key={col.key}>
                      {col.format && typeof player[col.key] === 'number'
                        ? col.format(player[col.key] as number)
                        : player[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeColumns.length} className="players-empty">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages} ({sortedPlayers.length} players)
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {isModalShowing && selectedPlayer && (
        <div className='modal-overlay' onClick={() => setIsModalShowing(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PlayerModal show={isModalShowing} onClose={() => setIsModalShowing(false)} player={selectedPlayer} />
          </div>
        </div>
      )}
    </div>
  )
}