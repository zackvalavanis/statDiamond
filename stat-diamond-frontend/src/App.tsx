import './App.css'
import { Header } from './Screens/Header/Header'
import { Footer } from './Screens/Footer/Footer'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { MainPage } from './Screens/MainPage/MainPage'
import { PlayerPage } from './Screens/PlayerPage/PlayerPage'

function App() {
  const router = createBrowserRouter([

    {
      element: (
        <div className="app-layout">
          <Header />
          <main className='content'>
            <Outlet />
          </main>
          <Footer />
        </div>
      ),
      children: [
        { path: '/', element: <MainPage /> },
        { path: '/player', element: <PlayerPage /> }
      ]
    }
  ])


  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
