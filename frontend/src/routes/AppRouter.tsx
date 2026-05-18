import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { ProfilePage } from '../pages/ProfilePage'
import { CreateScenarioPage } from '../pages/Scenarios/CreateScenarioPage'
import { ScenarioDetailsPage } from '../pages/Scenarios/ScenarioDetailsPage'
import { ScenariosPage } from '../pages/Scenarios/ScenariosPage'
import { TeamsPage } from '../pages/Teams/TeamPage'
import { TeamDetailsPage } from '../pages/Teams/TeamDetailsPage'
import { UsersPage } from '../pages/Users/UsersPage'
import { JoinTeamPage } from '../pages/Teams/JoinTeamPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UsersPage />} />

          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/join" element={<JoinTeamPage />} />
          <Route path="/teams/:id" element={<TeamDetailsPage />} />

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

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}