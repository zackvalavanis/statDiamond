export interface Player {
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


