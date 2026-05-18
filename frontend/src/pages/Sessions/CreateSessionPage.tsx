import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'
import { useSessionsStore } from '../../stores/sessionsStore'
import { useTeamsStore } from '../../stores/teamsStore'

const domainLabels: Record<string, string> = {
  CROP_PRODUCTION: 'Растениеводство',
  GREENHOUSE: 'Тепличное хозяйство',
  LIVESTOCK: 'Животноводство',
  LOGISTICS: 'Логистика',
  PROCESSING: 'Переработка продукции',
  ROBOTICS: 'Робототехника',
  TEAMBUILDING: 'Командное обучение',
}

function getDomainLabel(domain: string) {
  return domainLabels[domain] ?? domain
}

export function CreateSessionPage() {
  const navigate = useNavigate()

  const {
    scenarios,
    isLoading: isScenariosLoading,
    error: scenariosError,
    fetchScenarios,
    clearError: clearScenariosError,
  } = useScenariosStore()

  const {
    teams,
    status: teamsStatus,
    error: teamsError,
    fetchTeams,
    clearError: clearTeamsError,
  } = useTeamsStore()

  const {
    createSession,
    isLoading: isSessionLoading,
    error: sessionError,
    clearError: clearSessionError,
  } = useSessionsStore()

  const [scenarioId, setScenarioId] = useState('')
  const [teamId, setTeamId] = useState('')

  const isTeamsLoading = teamsStatus === 'loading'
  const isLoading = isScenariosLoading || isTeamsLoading || isSessionLoading

  const effectiveScenarioId = scenarioId || scenarios[0]?.id || ''
  const effectiveTeamId = teamId

  const selectedScenario = useMemo(
    () =>
      scenarios.find((scenario) => scenario.id === effectiveScenarioId) ?? null,
    [scenarios, effectiveScenarioId],
  )

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === effectiveTeamId) ?? null,
    [teams, effectiveTeamId],
  )

  useEffect(() => {
    void fetchScenarios()
    void fetchTeams()

    return () => {
      clearScenariosError()
      clearTeamsError()
      clearSessionError()
    }
  }, [
    fetchScenarios,
    fetchTeams,
    clearScenariosError,
    clearTeamsError,
    clearSessionError,
  ])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearSessionError()

    if (!effectiveScenarioId) {
      return
    }

    const session = await createSession({
      scenarioId: effectiveScenarioId,
      teamId: effectiveTeamId || null,
    })

    if (!session) {
      return
    }

    navigate(`/sessions/${session.id}`)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/sessions">
            ← К списку сессий
          </Link>

          <p className="eyebrow">Новая сессия</p>
          <h1>Создание игровой сессии</h1>

          <p>
            Сессия запускается на основе выбранного сценария и команды. После
            создания модератор сможет начать сессию и работать с событиями.
          </p>
        </div>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Параметры сессии</h2>

          <form className="task-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Сценарий</span>

              <select
                required
                value={effectiveScenarioId}
                onChange={(event) => setScenarioId(event.target.value)}
              >
                {scenarios.length === 0 && (
                  <option value="">Сначала создайте сценарий</option>
                )}

                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title} · {getDomainLabel(scenario.domain)}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Команда</span>

              <select
                value={effectiveTeamId}
                onChange={(event) => setTeamId(event.target.value)}
              >
                <option value="">Без команды</option>

                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                    {team.companyName ? ` · ${team.companyName}` : ''}
                  </option>
                ))}
              </select>
            </label>

            {(scenariosError || teamsError || sessionError) && (
              <div className="alert-error">
                <p>{scenariosError || teamsError || sessionError}</p>
              </div>
            )}

            <div className="form-actions">
              <Link className="button-secondary" to="/sessions">
                Отмена
              </Link>

              <button
                className="button-primary"
                type="submit"
                disabled={isLoading || !effectiveScenarioId}
              >
                {isSessionLoading ? 'Создание...' : 'Создать сессию'}
              </button>
            </div>
          </form>
        </article>

        <article className="details-card">
          <h2>Проверка перед созданием</h2>

          {!selectedScenario ? (
            <div className="empty-state">
              <h2>Сценарий не выбран</h2>

              <p>
                Для создания сессии нужен хотя бы один сценарий. Без сценария
                сессия не имеет содержания.
              </p>

              <Link className="button-primary" to="/scenarios/create">
                Создать сценарий
              </Link>
            </div>
          ) : (
            <div className="session-preview">
              <h3>{selectedScenario.title}</h3>
              <p>{selectedScenario.description}</p>

              <div className="scenario-card__meta">
                <span>{getDomainLabel(selectedScenario.domain)}</span>
                <span>Сложность: {selectedScenario.difficulty} / 5</span>
                <span>Задач: {selectedScenario.tasks?.length ?? 0}</span>
              </div>
            </div>
          )}

          {selectedTeam ? (
            <div className="session-preview">
              <h3>{selectedTeam.name}</h3>

              {selectedTeam.companyName && <p>{selectedTeam.companyName}</p>}
              {selectedTeam.description && <p>{selectedTeam.description}</p>}

              <div className="scenario-card__meta">
                <span>Участников: {selectedTeam.members?.length ?? 0}</span>
              </div>
            </div>
          ) : (
            <div className="info-box">
              <h3>Команда не выбрана</h3>

              <p>
                Сессию можно создать без команды, но для полноценного командного
                моделирования лучше назначить команду заранее.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}