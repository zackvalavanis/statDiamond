import './Header.css'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header>
      {/* Header Links below that are main form of navigation */}
      <Link className='stat-diamond' to='/'>Stat Diamond</Link>
      <div className='header-links'>
        <Link to='/'>Home</Link>
        <Link to='/'>Stats</Link>
        <Link to='/'>Players</Link>
      </div>
    </header>
  )
}