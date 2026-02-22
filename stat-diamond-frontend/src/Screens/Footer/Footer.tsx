import './Footer.css'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <div>
      <div className='footer-container'>
        <footer id='footer'>Stat Diamond
          <Link to='/login'>Login</Link>
        </footer>
      </div>

    </div>
  )
}