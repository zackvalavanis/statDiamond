import './MainPage.css'
import logo from '../../assets/StatDiamondLogo.png'

export function MainPage() {
  return (
    <>
      <div className='logo-container'>
        <img className='logo' src={logo} />
      </div>
    </>
  )
}