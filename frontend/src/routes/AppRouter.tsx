import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ScenariosPage } from '../pages/Scenarios/ScenariosPage'
import { ScenarioDetailsPage } from '../pages/Scenarios/ScenarioDetailsPage'
import { CreateScenarioPage } from '../pages/Scenarios/CreateScenarioPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/scenarios" element={<ScenariosPage />} />
        <Route path="/scenarios/:id" element={<ScenarioDetailsPage />} />
        <Route path="/scenarios/create" element={<CreateScenarioPage />} />
      </Routes>
    </BrowserRouter>
  )
}