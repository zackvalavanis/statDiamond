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
          <Link to='/'>Home</Link>
          <Link to='/'>Stats</Link>
          <Link to='/player'>Players</Link>
          {user && (<Link to='/profile'>Profile</Link>)}
        </div>
      </header>

    </div>
  )
}