import { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import type { LoginInfo } from '../../types/types'
import { useAuth } from '../../Context/UseAuth'
import toast from 'react-hot-toast'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const api = import.meta.env.VITE_API_URL

  const [formData, setFormData] = useState<LoginInfo>({
    username: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const handleLogin = async (formdata: LoginInfo) => {
    setLoading(true)

    try {
      const res = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: formdata.username,
          password: formdata.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.detail || "Login failed")
        return
      }

      if (!data?.access_token) {
        toast.error("No token returned from server")
        return
      }

      console.log("LOGIN SUCCESS:", data)

      login(data.access_token)

      toast.success("Logged in successfully")
      navigate('/')

    } catch (error) {
      console.error(error)
      toast.error("Server error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(formData)
  }

  return (
    <div className='login-page'>
      <div className='form-modal'>
        <form onSubmit={submit} className='form'>

          <label htmlFor='username'>Email</label>
          <input
            name='username'
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <label htmlFor='password'>Password</label>
          <input
            name='password'
            type='password'
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button type='submit' disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  )
}