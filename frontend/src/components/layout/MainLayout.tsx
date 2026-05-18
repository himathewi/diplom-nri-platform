import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/teams', label: 'Команды' },
  { to: '/scenarios', label: 'Сценарии' },
  { to: '/sessions', label: 'Сессии' },
  { to: '/profile', label: 'Профиль' },
]

export function MainLayout() {
  const {
    user,
    isAuthenticated,
    loadCurrentUser,
    logout,
  } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      void loadCurrentUser()
    }
  }, [isAuthenticated, user, loadCurrentUser])

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink className="app-logo" to="/">
          NRI Platform
        </NavLink>

        <nav className="app-nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-user">
          {user ? (
            <>
              <span>{user.name}</span>
              <button className="button-link" type="button" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink className="app-nav__link" to="/login">
                Вход
              </NavLink>
              <NavLink className="app-nav__link" to="/register">
                Регистрация
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}