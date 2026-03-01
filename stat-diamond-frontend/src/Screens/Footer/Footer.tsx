import './Footer.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../../Context/UseAuth'
import { useNavigate } from 'react-router-dom'

export function Footer() {
  const userLoggedIn = localStorage.getItem('token')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    logout()
    alert('User Logged Out')
    navigate('/login') 
  }

  return (
    <div>
      <div className='footer-container'>
        <footer id='footer'>Stat Diamond
          <Link to='/login'>Login</Link>
          {userLoggedIn && (
            <button onClick={handleLogout}>Logout</button>
          )}
          <Link to='/create-account'>New Account</Link>
        </footer>


      </div>

    </div>
  )
}