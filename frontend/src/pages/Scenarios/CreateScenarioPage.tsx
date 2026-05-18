import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'
import type { ScenarioDomain } from '../../types/scenario'

type DomainOption = {
  value: ScenarioDomain
  label: string
}

const domainOptions: DomainOption[] = [
  {
    value: 'CROP_PRODUCTION',
    label: 'Растениеводство',
  },
  {
    value: 'GREENHOUSE',
    label: 'Тепличное хозяйство',
  },
  {
    value: 'LIVESTOCK',
    label: 'Животноводство',
  },
  {
    value: 'LOGISTICS',
    label: 'Логистика',
  },
  {
    value: 'PROCESSING',
    label: 'Переработка продукции',
  },
  {
    value: 'ROBOTICS',
    label: 'Робототехника',
  },
  {
    value: 'TEAMBUILDING',
    label: 'Командное обучение',
  },
]

export function CreateScenarioPage() {
  const navigate = useNavigate()

  const { createScenario, isLoading, error, clearError } = useScenariosStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState<ScenarioDomain>('CROP_PRODUCTION')
  const [goal, setGoal] = useState('')
  const [difficulty, setDifficulty] = useState(1)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()
    const normalizedGoal = goal.trim()

    if (!normalizedTitle || !normalizedDescription || !normalizedGoal) {
      return
    }

    const scenario = await createScenario({
      title: normalizedTitle,
      description: normalizedDescription,
      domain,
      goal: normalizedGoal,
      difficulty,
    })

    navigate(`/scenarios/${scenario.id}`)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/scenarios">
            ← К списку сценариев
          </Link>

          <h1>Создание сценария</h1>

          <p>
            Сценарий описывает управляемую производственную ситуацию для
            командного моделирования, обучения сотрудников и анализа решений
            участников.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Название сценария</span>
          <input
            required
            maxLength={120}
            value={title}
            placeholder="Например: Сбой логистики во время уборочной кампании"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Направление АПК</span>
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value as ScenarioDomain)}
          >
            {domainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Сложность</span>
          <input
            required
            min={1}
            max={5}
            type="number"
            value={difficulty}
            onChange={(event) => {
              const value = Number(event.target.value)
              setDifficulty(Math.min(5, Math.max(1, value)))
            }}
          />
        </label>

        <label className="form-field">
          <span>Описание ситуации</span>
          <textarea
            required
            rows={6}
            value={description}
            placeholder="Опишите вводную ситуацию, ограничения, участников и контекст производственного процесса."
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Цель сценария</span>
          <textarea
            required
            rows={4}
            value={goal}
            placeholder="Например: отработать распределение ресурсов, коммуникацию между ролями и принятие решений в условиях нехватки времени."
            onChange={(event) => setGoal(event.target.value)}
          />
        </label>

        {error && (
          <div className="alert-error">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <Link className="button-secondary" to="/scenarios">
            Отмена
          </Link>

          <button className="button-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Создание...' : 'Создать сценарий'}
          </button>
        </div>
      </form>
    </section>
  )
}