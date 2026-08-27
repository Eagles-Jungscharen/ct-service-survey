import { makeStyles, tokens, Spinner } from '@fluentui/react-components'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'
import { UserMenu } from './UserMenu'
import { useAppAuth } from '../hooks/useAppAuthContext'
import { ActivateSurveyPage } from '../pages/ActivateSurveyPage'
import { AdminSurveyManagePage } from '../pages/AdminSurveyManagePage'
import { AssignmentsPage } from '../pages/AssignmentsPage'
import { CallbackPage } from '../pages/CallbackPage'
import { CreateSurveyWizard } from '../pages/CreateSurveyWizard'
import { HomePage } from '../pages/HomePage'
import { MyAssignmentsPage } from '../pages/MyAssignmentsPage'
import { SurveyByTagPage } from '../pages/SurveyByTagPage'
import { SurveyDetailPage } from '../pages/SurveyDetailPage'
import { SurveyResponsePage } from '../pages/SurveyResponsePage'
import { SurveysListPage } from '../pages/SurveysListPage'

const useStyles = makeStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
    boxShadow: tokens.shadow4,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: {
    display: 'flex',
    gap: tokens.spacingHorizontalXL,
    marginTop: tokens.spacingVerticalM,
  },
  navLink: {
    color: tokens.colorNeutralForegroundOnBrand,
    textDecoration: 'none',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  main: {
    flex: 1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
})

export const AppContent: React.FunctionComponent = () => {
  const styles = useStyles()
  const auth = useAppAuth()


  // Auth-Loading-State
  if (auth.isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner label="Anwendung wird geladen..." />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className={styles.app}>
        {auth.isAuthenticated && (
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <h1>ChurchTools Service Survey</h1>
              <UserMenu />
            </div>
            <nav className={styles.nav}>
              <Link to="/surveys" className={styles.navLink}>
                Umfragen
              </Link>
              <Link to="/my-assignments" className={styles.navLink}>
                Meine Einteilungen
              </Link>
              <Link to="/admin/surveys" className={styles.navLink}>
                Verwaltung
              </Link>
            </nav>
          </header>
        )}
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />

            {/* Öffentliche TAG-basierte Umfragen-Zugriff */}
            <Route path="/survey" element={<SurveyByTagPage />} />
            <Route path="/survey/:tag" element={<SurveyByTagPage />} />

            {/* Öffentliche/Geschützte Routen */}
            <Route
              path="/surveys"
              element={
                <ProtectedRoute>
                  <SurveysListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/:id"
              element={
                <ProtectedRoute>
                  <SurveyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/:id/respond"
              element={
                <ProtectedRoute>
                  <SurveyResponsePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-assignments"
              element={
                <ProtectedRoute>
                  <MyAssignmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin-Routen */}
            <Route
              path="/admin/surveys"
              element={
                <ProtectedRoute requireAdmin>
                  <SurveysListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/surveys/new"
              element={
                <ProtectedRoute requireAdmin>
                  <CreateSurveyWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/surveys/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSurveyManagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/surveys/:id/activate"
              element={
                <ProtectedRoute requireAdmin>
                  <ActivateSurveyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/surveys/:id/assignments"
              element={
                <ProtectedRoute requireAdmin>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
