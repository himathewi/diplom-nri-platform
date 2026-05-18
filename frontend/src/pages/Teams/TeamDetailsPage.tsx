import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTeamsStore } from '../../stores/teamsStore'

export function TeamDetailsPage() {
  const { id } = useParams()

  const {
    selectedTeam,
    status,
    error,
    fetchTeamById,
    addTeamMember,
    removeTeamMember,
    setSelectedTeam,
    clearError,
  } = useTeamsStore()

  const [userId, setUserId] = useState('')
  const [roleInTeam, setRoleInTeam] = useState('participant')

  const isLoading = status === 'loading'

  useEffect(() => {
    if (id) {
      void fetchTeamById(id)
    }

    return () => {
      setSelectedTeam(null)
      clearError()
    }
  }, [id, fetchTeamById, setSelectedTeam, clearError])

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    if (!id) {
      return
    }

    const normalizedUserId = userId.trim()
    const normalizedRole = roleInTeam.trim()

    if (!normalizedUserId) {
      return
    }

    const member = await addTeamMember(id, {
      userId: normalizedUserId,
      roleInTeam: normalizedRole || null,
    })

    if (!member) {
      return
    }

    setUserId('')
    setRoleInTeam('participant')
  }

  async function handleRemoveMember(memberUserId: string) {
    if (!id) {
      return
    }

    const confirmed = window.confirm('Удалить участника из команды?')

    if (!confirmed) {
      return
    }

    await removeTeamMember(id, memberUserId)
  }

  if (!id) {
    return (
      <section>
        <h1>Команда не найдена</h1>
        <p>В адресе страницы отсутствует идентификатор команды.</p>
        <Link className="text-link" to="/teams">
          ← Вернуться к командам
        </Link>
      </section>
    )
  }

  if (isLoading && !selectedTeam) {
    return (
      <section>
        <p>Загрузка команды...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="alert-error">
          <p>{error}</p>
        </div>

        <Link className="text-link" to="/teams">
          ← Вернуться к командам
        </Link>
      </section>
    )
  }

  if (!selectedTeam) {
    return (
      <section>
        <h1>Команда не найдена</h1>
        <p>Возможно, команда была удалена или недоступна текущему пользователю.</p>

        <Link className="text-link" to="/teams">
          ← Вернуться к командам
        </Link>
      </section>
    )
  }

  const members = selectedTeam.members ?? []

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/teams">
            ← К списку команд
          </Link>

          <p className="eyebrow">Команда</p>
          <h1>{selectedTeam.name}</h1>

          {selectedTeam.companyName && <p>{selectedTeam.companyName}</p>}
          {selectedTeam.description && <p>{selectedTeam.description}</p>}
        </div>
      </div>

      <div className="details-grid">
        <article className="details-card">
            <h2>Приглашение участников</h2>

            <div className="invite-panel">
                <div>
                <h3>Ссылка приглашения</h3>
                <p>
                    Модератор сможет создать ссылку и отправить её участнику. После входа в
                    систему пользователь сможет принять приглашение и попасть в команду.
                </p>
                </div>

                <button className="button-secondary" type="button" disabled>
                Создать ссылку
                </button>
            </div>

            <div className="invite-panel">
                <div>
                <h3>Код команды</h3>
                <p>
                    Для очной учебной сессии модератор сможет показать короткий код, а
                    участники введут его на странице присоединения к команде.
                </p>
                </div>

                <button className="button-secondary" type="button" disabled>
                Сгенерировать код
                </button>
            </div>

            <div className="info-box">
                <h3>MVP-режим</h3>
                <p>
                До появления backend endpoint для приглашений участника можно добавить по
                ID пользователя. Это технический режим для проверки работы модуля команд,
                а не финальная модель пользовательского доступа.
                </p>
            </div>

            <form className="task-form team-member-form" onSubmit={handleAddMember}>
            <label className="form-field">
              <span>ID пользователя</span>
              <input
                required
                value={userId}
                placeholder="Например: user id из профиля"
                onChange={(event) => setUserId(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Роль в команде</span>
              <select
                value={roleInTeam}
                onChange={(event) => setRoleInTeam(event.target.value)}
              >
                <option value="participant">Участник</option>
                <option value="agronomist">Агроном</option>
                <option value="engineer">Инженер</option>
                <option value="operator">Оператор техники</option>
                <option value="logistician">Логист</option>
                <option value="quality_specialist">Специалист по качеству</option>
                <option value="shift_lead">Руководитель смены</option>
                <option value="robotics_operator">Оператор робототехники</option>
              </select>
            </label>

            <div className="form-actions">
              <button
                className="button-primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Добавление...' : 'Добавить участника'}
              </button>
            </div>
          </form>
        </article>

        <article className="details-card">
          <h2>Участники команды</h2>

          {members.length === 0 ? (
            <div className="empty-state">
              <h2>Участников пока нет</h2>
              <p>
                Добавьте пользователей в команду, чтобы затем использовать её в
                сценарной сессии.
              </p>
            </div>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <article className="member-card" key={member.id}>
                  <div>
                    <h3>{member.user?.name ?? `Пользователь ${member.userId}`}</h3>

                    <p>
                      {member.user?.email ?? 'Email не загружен'}
                    </p>

                    <div className="scenario-card__meta">
                      <span>ID: {member.userId}</span>
                      {member.roleInTeam && <span>{member.roleInTeam}</span>}
                    </div>
                  </div>

                  <button
                    className="button-ghost-danger"
                    type="button"
                    onClick={() => handleRemoveMember(member.userId)}
                  >
                    Удалить
                  </button>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}