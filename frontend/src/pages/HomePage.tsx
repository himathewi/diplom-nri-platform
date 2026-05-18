import { Link } from 'react-router-dom'

const modules = [
  {
    title: 'Auth',
    description: 'Регистрация, вход, JWT и получение текущего пользователя.',
    to: '/login',
  },
  {
    title: 'Users',
    description: 'Просмотр пользователей, ролей и базовой информации профиля.',
    to: '/profile',
  },
  {
    title: 'Teams',
    description: 'Создание команд и добавление участников в командную сессию.',
    to: '/teams',
  },
  {
    title: 'Scenarios',
    description: 'Создание НРИ-сценариев и задач для производственных ситуаций АПК.',
    to: '/scenarios',
  },
  {
    title: 'Sessions',
    description: 'Запуск, проведение и завершение игровых сессий.',
    to: '/sessions',
  },
]

export function HomePage() {
  return (
    <section className="home-page">
      <div className="hero-card">
        <p className="eyebrow">Дипломный проект</p>

        <h1>Портал модерации НРИ</h1>

        <p>
          Онлайн-портал предназначен для проведения настольно-ролевых сценариев,
          командного моделирования и анализа решений участников.
        </p>

        <p>
          В рамках дипломного проекта интерфейс применяется для сценариев,
          связанных с производственными ситуациями агропромышленного комплекса.
        </p>

        <div className="hero-actions">
          <Link className="button-primary" to="/scenarios">
            Перейти к сценариям
          </Link>

          <Link className="button-secondary" to="/teams">
            Открыть команды
          </Link>
        </div>
      </div>

      <div className="module-grid">
        {modules.map((module) => (
          <Link className="module-card" key={module.title} to={module.to}>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}