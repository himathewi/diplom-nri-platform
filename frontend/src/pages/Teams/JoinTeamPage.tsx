import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

export function JoinTeamPage() {
  const [joinCode, setJoinCode] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedCode = joinCode.trim().toUpperCase()

    if (!normalizedCode) {
      return
    }

    window.alert(
      'Присоединение по коду будет доступно после добавления backend endpoint /teams/join.',
    )
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/teams">
            ← К списку команд
          </Link>

          <p className="eyebrow">Присоединение</p>
          <h1>Вступить в команду</h1>

          <p>
            Участник может присоединиться к команде по короткому коду, который
            выдаёт модератор во время подготовки сценарной сессии.
          </p>
        </div>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Код команды</h2>

          <p>
            Этот способ удобен для очных занятий, демонстраций и учебных
            сценариев: модератор показывает код, а участники самостоятельно
            присоединяются к команде.
          </p>

          <form className="task-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Введите код</span>
              <input
                required
                value={joinCode}
                placeholder="Например: AGRO-4821"
                onChange={(event) => setJoinCode(event.target.value)}
              />
            </label>

            <div className="form-actions">
              <button className="button-primary" type="submit">
                Присоединиться
              </button>
            </div>
          </form>
        </article>

        <article className="details-card">
          <h2>Как это будет работать</h2>

          <ol className="steps-list">
            <li>Модератор создаёт команду.</li>
            <li>Система генерирует короткий код команды.</li>
            <li>Участник входит в портал или регистрируется.</li>
            <li>Участник вводит код на этой странице.</li>
            <li>Backend добавляет текущего пользователя в команду.</li>
          </ol>

          <div className="info-box">
            <h3>Почему не список пользователей?</h3>
            <p>
              Портал не должен показывать всем модераторам полный список
              пользователей. Присоединение по коду снижает лишний доступ к
              персональным данным и лучше подходит для командного обучения.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}