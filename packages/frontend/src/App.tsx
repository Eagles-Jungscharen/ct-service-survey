import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FluentProvider, webLightTheme, makeStyles, tokens, Spinner } from '@fluentui/react-components'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { useEffect } from 'react'
import { oidcConfig } from './config/oidc'
import { apiClient } from './services/api'
import { SurveysListPage } from './pages/SurveysListPage'
import { SurveyDetailPage } from './pages/SurveyDetailPage'
import { SurveyResponsePage } from './pages/SurveyResponsePage'
import { MyAssignmentsPage } from './pages/MyAssignmentsPage'
import { AdminSurveyManagePage } from './pages/AdminSurveyManagePage'
import { CreateSurveyPage } from './pages/CreateSurveyPage'
import { AddServiceDatePage } from './pages/AddServiceDatePage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { CallbackPage } from './pages/CallbackPage'
import { HomePage } from './pages/HomePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserMenu } from './components/UserMenu'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

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

function AppContent() {
  const styles = useStyles()
  const auth = useAuth()

  // Token-Getter für API-Client registrieren
  useEffect(() => {
    apiClient.setTokenGetter(() => {
      return auth.user?.access_token || null
    })
  }, [auth.user])

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
            <Route path="/callback" element={<CallbackPage />} />
            
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
                  <CreateSurveyPage />
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
              path="/admin/surveys/:id/add-servicedate" 
              element={
                <ProtectedRoute requireAdmin>
                  <AddServiceDatePage />
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

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <AuthProvider {...oidcConfig}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </AuthProvider>
    </FluentProvider>
  )
}

export default App
