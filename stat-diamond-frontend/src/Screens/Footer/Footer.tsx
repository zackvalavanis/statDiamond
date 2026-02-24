import './Footer.css'
import { Link } from 'react-router-dom'

export function Footer() {
  const userLoggedIn = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (localStorage.getItem('token')) {
      alert('User Logged Out')
    }
  }


  return (
    <div>
      <div className='footer-container'>
        <footer id='footer'>Stat Diamond
          <Link to='/login'>Login</Link>
          {userLoggedIn && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </footer>

      </div>

    </div>
  )
}