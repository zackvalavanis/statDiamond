import './Teams.css'
import { Link } from 'react-router-dom'

export function Teams() {
  return (
    <div className='leagues-container'>
      <div className='division-container'>
        <h1>National League</h1>
        <div className='division'>
          <h2>NL Central</h2>
          <p><Link to='/teams/CHC'>Chicago Cubs</Link></p>
          <p><Link to='/teams/CIN'>Cincinnati Reds</Link></p>
          <p><Link to='/teams/MIL'>Milwaukee Brewers</Link></p>
          <p><Link to='/teams/PIT'>Pittsburgh Pirates</Link></p>
          <p><Link to='/teams/STL'>St. Louis Cardinals</Link></p>
        </div>

        <div className='division'>
          <h2>NL West</h2>
          <p><Link to='/teams/ARI'>Arizona Diamondbacks</Link></p>
          <p><Link to='/teams/COL'>Colorado Rockies</Link></p>
          <p><Link to='/teams/LAD'>Los Angeles Dodgers</Link></p>
          <p><Link to='/teams/SDP'>San Diego Padres</Link></p>
          <p><Link to='/teams/SFG'>San Francisco Giants</Link></p>
        </div>

        <div className='division'>
          <h2>NL East</h2>
          <p><Link to='/teams/ATL'>Atlanta Braves</Link></p>
          <p><Link to='/teams/MIA'>Miami Marlins</Link></p>
          <p><Link to='/teams/NYM'>New York Mets</Link></p>
          <p><Link to='/teams/PHI'>Philadelphia Phillies</Link></p>
          <p><Link to='/teams/WSN'>Washington Nationals</Link></p>
        </div>
      </div>

      <div className='division-container'>
        <h1>American League</h1>

        <div className='division'>
          <h2>AL Central</h2>
          <p><Link to='/teams/CHW'>Chicago White Sox</Link></p>
          <p><Link to='/teams/CLE'>Cleveland Guardians</Link></p>
          <p><Link to='/teams/DET'>Detroit Tigers</Link></p>
          <p><Link to='/teams/KCR'>Kansas City Royals</Link></p>
          <p><Link to='/teams/MIN'>Minnesota Twins</Link></p>
        </div>

        <div className='division'>
          <h2>AL West</h2>
          <p><Link to='/teams/HOU'>Houston Astros</Link></p>
          <p><Link to='/teams/LAA'>Los Angeles Angels</Link></p>
          <p><Link to='/teams/OAK'>Oakland Athletics</Link></p>
          <p><Link to='/teams/SEA'>Seattle Mariners</Link></p>
          <p><Link to='/teams/TEX'>Texas Rangers</Link></p>
        </div>

        <div className='division'>
          <h2>AL East</h2>
          <p><Link to='/teams/BAL'>Baltimore Orioles</Link></p>
          <p><Link to='/teams/BOS'>Boston Red Sox</Link></p>
          <p><Link to='/teams/NYY'>New York Yankees</Link></p>
          <p><Link to='/teams/TBR'>Tampa Bay Rays</Link></p>
          <p><Link to='/teams/TOR'>Toronto Blue Jays</Link></p>
        </div>
      </div>
    </div>
  )
}