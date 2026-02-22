import './Login.css'


// interface LoginInfo {
//   name: string
//   email: string
//   password: string
// }

export function Login() {
  return (
    <div className='login-page'>
      <div className='form-modal'>
        <form className='form'>
          <label className='label-login-page' htmlFor='username'>Email</label>
          <input name='email'></input>

          <label className='label-login-page' htmlFor='username'>Username</label>
          <input name='username'></input>


          <label className='label-login-page' htmlFor='password'>Password</label>
          <input name='password_digest'></input>

          <button>Login</button>
        </form>
      </div>
    </div>
  )
}