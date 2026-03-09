import { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import type { LoginInfo } from '../../types/types'
import { useAuth } from '../../Context/UseAuth'
import toast from 'react-hot-toast'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginInfo>({
    username: "",
    password: ""
  })


  const handlelogin = async (formdata: LoginInfo) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: formdata.username,
          password: formdata.password
        })
      });
      const data = await res.json()
      console.log(data)
      await login(data.access_token)
      toast.success("User Logged in.")
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handlelogin(formData);
  }


  return (
    <div className='login-page'>
      <div className='form-modal'>
        <form onSubmit={submit} className='form'>
          <label className='label-login-page' htmlFor='username'>Email</label>

          <input
            name='username'
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          >
          </input>

          <label className='label-login-page' htmlFor='password'>Password</label>
          <input
            name='password_digest'
            type='password'
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          ></input>
          <button type='submit'>Login</button>
        </form>
      </div>
    </div>
  )
}