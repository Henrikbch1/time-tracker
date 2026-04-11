import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { TrackerProvider } from './context/TrackerContext'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter basename="/time-tracker">
      <ThemeProvider>
        <LanguageProvider>
          <TrackerProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </TrackerProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
