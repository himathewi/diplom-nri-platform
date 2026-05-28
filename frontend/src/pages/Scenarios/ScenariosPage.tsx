import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'
import type { ScenarioDomain } from '../../types/scenario'
import { getLabel, scenarioDomainLabels } from '../../constants/labels'

const domainOptions: Array<{ value: ScenarioDomain | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все направления' },
  { value: 'CROP_PRODUCTION', label: 'Растениеводство' },
  { value: 'GREENHOUSE', label: 'Тепличное хозяйство' },
  { value: 'LIVESTOCK', label: 'Животноводство' },
  { value: 'LOGISTICS', label: 'Логистика' },
  { value: 'PROCESSING', label: 'Переработка продукции' },
  { value: 'ROBOTICS', label: 'Робототехника' },
  { value: 'TEAMBUILDING', label: 'Командное обучение' },
]



export function ScenariosPage() {
  const { scenarios, isLoading, error, fetchScenarios, clearError } =
    useScenariosStore()

  const [selectedDomain, setSelectedDomain] =
    useState<ScenarioDomain | 'ALL'>('ALL')

  useEffect(() => {
    void fetchScenarios()

    return () => {
      clearError()
    }
  }, [fetchScenarios, clearError])

  const filteredScenarios = useMemo(() => {
    if (selectedDomain === 'ALL') {
      return scenarios
    }

    return scenarios.filter((scenario) => scenario.domain === selectedDomain)
  }, [scenarios, selectedDomain])

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Сценарное моделирование</p>

          <h1>Сценарии</h1>

          <p>
            Сценарии используются для моделирования производственных ситуаций
            АПК, командного взаимодействия и анализа решений участников.
          </p>
        </div>

        <Link className="button-primary" to="/scenarios/create">
          Создать сценарий
        </Link>
      </div>

      <div className="toolbar">
        <label className="toolbar-field">
          <span>Направление</span>

          <select
            value={selectedDomain}
            onChange={(event) =>
              setSelectedDomain(event.target.value as ScenarioDomain | 'ALL')
            }
          >
            {domainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p>
          Найдено сценариев: <strong>{filteredScenarios.length}</strong>
        </p>
      </div>

      {isLoading && <p>Загрузка сценариев...</p>}

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && scenarios.length === 0 && (
        <div className="empty-state">
          <h2>Сценариев пока нет</h2>

          <p>
            Создайте первый сценарий для командной сессии: например, сбой
            логистики во время уборочной кампании или нештатную ситуацию в
            тепличном хозяйстве.
          </p>

          <Link className="button-primary" to="/scenarios/create">
            Создать первый сценарий
          </Link>
        </div>
      )}

      {!isLoading &&
        !error &&
        scenarios.length > 0 &&
        filteredScenarios.length === 0 && (
          <div className="empty-state">
            <h2>По выбранному направлению сценариев нет</h2>

            <p>
              Измените фильтр или создайте новый сценарий для выбранного
              направления АПК.
            </p>
          </div>
        )}

      <div className="cards-grid">
        {filteredScenarios.map((scenario) => (
          <article className="scenario-card" key={scenario.id}>
            <div className="scenario-card__header">
              <h2>{scenario.title}</h2>
              <span>Сложность: {scenario.difficulty} / 5</span>
            </div>

            <p>{scenario.description}</p>

            <div className="scenario-card__meta">
              <span>{getLabel(scenarioDomainLabels, scenario.domain)}</span>
              <span>Задач: {scenario.tasks?.length ?? 0}</span>
            </div>

            <div className="card-actions">
              <Link className="button-secondary" to={`/scenarios/${scenario.id}`}>
                Открыть
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}