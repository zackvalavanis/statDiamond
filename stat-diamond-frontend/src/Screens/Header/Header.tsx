import './Header.css'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header>
      <div className='header-links'>
        <Link to='/'>Home</Link>
        <Link to='/'>Stats</Link>
        <Link to='/'>Players</Link>
      </div>
    </header>
  )
}