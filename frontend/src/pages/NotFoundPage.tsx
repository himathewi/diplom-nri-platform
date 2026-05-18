import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main>
      <h1>Страница не найдена</h1>

      <p>Такого раздела в портале не существует.</p>

      <Link to="/">Вернуться на главную</Link>
    </main>
  )
}