import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()

  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !password) {
      return
    }

    await login({
      email: normalizedEmail,
      password,
    })

    navigate('/profile')
  }

  return (
    <section>
      <div className="auth-card">
        <p className="eyebrow">Авторизация</p>

        <h1>Вход в портал</h1>

        <p>
          Войдите в систему, чтобы получить доступ к сценариям, командам и
          игровым сессиям.
        </p>

        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              required
              autoComplete="email"
              type="email"
              value={email}
              placeholder="moderator@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>
            <input
              required
              autoComplete="current-password"
              type="password"
              value={password}
              placeholder="Введите пароль"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <div className="alert-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <Link className="button-secondary" to="/register">
              Регистрация
            </Link>

            <button className="button-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}