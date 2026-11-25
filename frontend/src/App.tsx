import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProfileProvider } from "./context/ProfileContext";
import { TrackerProvider } from "./context/TrackerContext";
import AppLayout from "./components/layout/AppLayout";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

export default function App() {
  return (
    // HashRouter: GitHub Pages only serves index.html at the root, so deep links
    // (and browser back after a page reload) must not hit the server.
    <HashRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ProfileProvider>
            <TrackerProvider>
              <Suspense fallback={null}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/track" element={<TrackingPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </TrackerProvider>
          </ProfileProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
