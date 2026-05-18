import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  PARTICIPANT: 'Участник',
  EXPERT: 'Эксперт',
}

export function ProfilePage() {
  const {
    user,
    isLoading,
    isAuthenticated,
    loadCurrentUser,
    logout,
  } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      void loadCurrentUser()
    }
  }, [isAuthenticated, user, loadCurrentUser])

  if (isLoading && !user) {
    return (
      <section>
        <p>Загрузка профиля...</p>
      </section>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <section>
        <div className="section-card">
          <p className="eyebrow">Гость</p>
          <h1>Пользователь не авторизован</h1>
          <p>
            Войдите в систему, чтобы работать со сценариями, командами и
            игровыми сессиями.
          </p>

          <div className="hero-actions">
            <Link className="button-primary" to="/login">
              Войти
            </Link>

            <Link className="button-secondary" to="/register">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="section-card">
        <p className="eyebrow">Профиль</p>

        <h1>{user.name}</h1>

        <dl className="details-list">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>

          <div>
            <dt>Роль</dt>
            <dd>{roleLabels[user.role] ?? user.role}</dd>
          </div>

          <div>
            <dt>ID пользователя</dt>
            <dd>{user.id}</dd>
          </div>
        </dl>

        <div className="hero-actions">
          <button className="button-danger" type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </div>
    </section>
  )
}