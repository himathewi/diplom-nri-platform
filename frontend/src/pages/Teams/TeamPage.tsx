import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeamsStore } from '../../stores/teamsStore'

export function TeamsPage() {
  const {
    teams,
    status,
    error,
    fetchTeams,
    createTeam,
    deleteTeam,
    clearError,
  } = useTeamsStore()

  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')

  const isLoading = status === 'loading'

  useEffect(() => {
    void fetchTeams()

    return () => {
      clearError()
    }
  }, [fetchTeams, clearError])

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const normalizedName = name.trim()
    const normalizedCompanyName = companyName.trim()
    const normalizedDescription = description.trim()

    if (!normalizedName) {
      return
    }

    const createdTeam = await createTeam({
      name: normalizedName,
      companyName: normalizedCompanyName || null,
      description: normalizedDescription || null,
    })

    if (!createdTeam) {
      return
    }

    setName('')
    setCompanyName('')
    setDescription('')
  }

  async function handleDeleteTeam(teamId: string) {
    const confirmed = window.confirm('Удалить команду?')

    if (!confirmed) {
      return
    }

    await deleteTeam(teamId)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Командная работа</p>
          <h1>Команды</h1>
          <p>
            Команды используются для группировки участников сценарных сессий,
            моделирования производственных ролей и анализа совместных решений.
          </p>
        </div>

        <Link className="button-secondary" to="/teams/join">
          Вступить по коду
        </Link>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Создание команды</h2>

          <form className="task-form" onSubmit={handleCreateTeam}>
            <label className="form-field">
              <span>Название команды</span>
              <input
                required
                maxLength={120}
                value={name}
                placeholder="Например: Смена тепличного комплекса"
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Организация</span>
              <input
                maxLength={160}
                value={companyName}
                placeholder="Например: АПК Северный"
                onChange={(event) => setCompanyName(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Описание</span>
              <textarea
                rows={4}
                value={description}
                placeholder="Кратко опишите состав команды, направление работы или учебную задачу."
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            {error && (
              <div className="alert-error">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                className="button-primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Создать команду'}
              </button>
            </div>
          </form>
        </article>

        <article className="details-card">
          <h2>Список команд</h2>

          {isLoading && teams.length === 0 && <p>Загрузка команд...</p>}

          {!isLoading && teams.length === 0 && (
            <div className="empty-state">
              <h2>Команд пока нет</h2>
              <p>
                Создайте первую команду, чтобы позже использовать её при запуске
                сценарной сессии.
              </p>
            </div>
          )}

          {teams.length > 0 && (
            <div className="cards-grid">
              {teams.map((team) => (
                <article className="scenario-card" key={team.id}>
                  <div className="scenario-card__header">
                    <h2>{team.name}</h2>
                    <span>Участников: {team.members?.length ?? 0}</span>
                  </div>

                  {team.companyName && <p>{team.companyName}</p>}

                  {team.description && <p>{team.description}</p>}

                  <div className="scenario-card__meta">
                    <span>ID: {team.id}</span>
                  </div>

                  <div className="card-actions">
                    <Link className="button-secondary" to={`/teams/${team.id}`}>
                      Открыть
                    </Link>

                    <button
                      className="button-ghost-danger"
                      type="button"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}