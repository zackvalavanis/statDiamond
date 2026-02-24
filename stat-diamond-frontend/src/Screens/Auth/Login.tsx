import { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'


interface LoginInfo {
  username: string
  password: string
}

export function Login() {
  const navigate = useNavigate()
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
      localStorage.setItem('token', data.access_token)
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
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          ></input>
          <button type='submit'>Login</button>
        </form>
      </div>
    </div>
  )
}