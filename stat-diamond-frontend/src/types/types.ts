export interface Player {
  id: number
  name: string
  batting_avg: number
  position: string
  team: string
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