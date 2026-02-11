import './MainPage.css'
import logo from '../../assets/StatDiamondLogo.png'
import { ModalHome } from './Modal-home'
import { useState } from 'react'


export function MainPage() {
  const [modalShowing, setModalShowing] = useState(false)

  const openModal = () => {
    setModalShowing(true)
  }

  return (
    <>
      <div className='logo-container'>
        <img className='logo' src={logo} />
        <ModalHome
          show={modalShowing}
          onClose={() => setModalShowing(false)}
        />
        <button onClick={openModal}>Open Modal</button>
      </div>
    </>
  )
}