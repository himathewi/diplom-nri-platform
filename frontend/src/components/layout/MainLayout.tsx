import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/login', label: 'Вход' },
  { to: '/register', label: 'Регистрация' },
  { to: '/teams', label: 'Команды' },
  { to: '/scenarios', label: 'Сценарии' },
  { to: '/sessions', label: 'Сессии' },
  { to: '/profile', label: 'Профиль' },
]

export function MainLayout() {
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
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}