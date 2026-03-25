import './Header.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../../Context/UseAuth'


export function Header() {
  const { user } = useAuth()

  return (
    <div>
      <header>
        {/* Header Links below that are main form of navigation */}
        <Link className='stat-diamond' to='/'>Stat Diamond</Link>
        <div className='header-links'>
          <Link to='/teams'>Standings</Link>
          <Link to='/news'>News</Link>
          <Link to='/live-games'>Live Games</Link>
          {user && (<Link to='/profile'>Profile</Link>)}
        </div>
      </header>

    </div>
  )
}