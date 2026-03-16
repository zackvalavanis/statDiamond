export interface Player {
  IDfg: number
  Season: number
  Name: string
  Team: string
  Age: number
  G?: number
  AB?: number
  PA?: number
  H?: number
  R?: number
  HR?: number
  RBI?: number
  SB?: number
  BB?: number
  K?: number
  'BB%'?: number
  'K%'?: number
  AVG?: number
  OBP?: number
  SLG?: number
  OPS?: number
  WAR?: number
  Pos?: string
  ERA?: string
  SO?: string
  Position?: string | null
  Dol?: string | null
  key_mlbam?: number
  key_bbref?: string
}

export interface PlayerSplit {
  season: string
  team: { id: number; name: string }
  stat: {
    gamesPlayed: number
    atBats: number
    plateAppearances: number
    hits: number
    homeRuns: number
    runs: number
    rbi: number
    stolenBases: number
    baseOnBalls: number
    strikeOuts: number
    avg: string
    obp: string
    slg: string
    ops: string
    doubles: number
    triples: number
  }
}

export interface PlayerModalProps {
  show: boolean,
  onClose: () => void
  player: Player | null
}

export interface ModalHomeProps {
  show: boolean
  onClose: () => void
}

export interface CreateUserInfo {
  name: string
  email: string
  password: string
}

export interface LoginInfo {
  username: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}


export interface FavoritePlayer {
  id: string
  player_id: string
  player_name: string
  user_id: string
  created_at: string
}

export interface Roster {
  IDfg: number
  Season: number
  Name: string
  Team: string
  Age: number
  G?: number          // Games
  AB?: number         // At Bats
  H?: number          // Hits
  AVG?: number        // Batting Average
  OBP?: number        // On Base Percentage
  SLG?: number        // Slugging
  HR?: number         // Home Runs
  RBI?: number        // RBIs
  BB?: number         // Walks
  K?: number          // Strikeouts
  Pos?: string        // Position (if available)
}


