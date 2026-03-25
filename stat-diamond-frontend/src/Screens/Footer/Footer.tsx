import './Footer.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../../Context/UseAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function Footer() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    logout()
    toast.success('User Logged Out')
    navigate('/login')
  }

  return (
    <div>
      <div className='footer-container'>
        <footer className="footer">
          <span className="footer-branding">Stat Diamond — Powered by React & FastAPI</span>
          <div className="footer-links">
            {user ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/create-account">New Account</Link>
              </>
            )}
            <Link to='advanced-stats'>Advanced Stats</Link>
            <Link to='/player'>Hitting Stats</Link>
            <Link to='/player'>Pitching Stats</Link>
          </div>
        </footer>
      </div>

    </div>
  )
}