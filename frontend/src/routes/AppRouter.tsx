import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { CreateScenarioPage } from '../pages/Scenarios/CreateScenarioPage'
import { ScenarioDetailsPage } from '../pages/Scenarios/ScenarioDetailsPage'
import { ScenariosPage } from '../pages/Scenarios/ScenariosPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <PlaceholderPage
                title="Вход"
                description="Здесь будет форма авторизации пользователя через backend auth API."
              />
            }
          />

          <Route
            path="/register"
            element={
              <PlaceholderPage
                title="Регистрация"
                description="Здесь будет форма создания пользователя с выбором роли и последующим входом в систему."
              />
            }
          />

          <Route
            path="/teams"
            element={
              <PlaceholderPage
                title="Команды"
                description="Здесь будет интерфейс создания команд и управления участниками."
              />
            }
          />

          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/scenarios/create" element={<CreateScenarioPage />} />
          <Route path="/scenarios/:id" element={<ScenarioDetailsPage />} />

          <Route
            path="/sessions"
            element={
              <PlaceholderPage
                title="Сессии"
                description="Здесь будет интерфейс запуска, проведения и завершения игровых сессий."
              />
            }
          />

          <Route
            path="/profile"
            element={
              <PlaceholderPage
                title="Профиль пользователя"
                description="Здесь будет отображаться текущий пользователь, его роль и доступные действия."
              />
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}