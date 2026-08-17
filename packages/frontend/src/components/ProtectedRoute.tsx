import { ReactNode, useEffect } from 'react'
import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components'
import { useAuth } from 'react-oidc-context'
import { useAppAuth } from '../hooks/useAppAuthContext'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: tokens.spacingVerticalXXL,
  },
})

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const styles = useStyles();
  const {isLoading,isAuthenticated, isAdmin, login} = useAppAuth() // This line seems unnecessary since the returned value is not used
  
  useEffect(() => {
    // Wenn nicht authentifiziert, redirect zu Login
    if (!isLoading && !isAuthenticated) {
      login()
    }
  }, [isLoading, isAuthenticated, login])

  // Während Auth lädt
  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Authentifizierung wird geprüft..." />
      </div>
    )
  }

  // Nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Spinner label="Weiterleitung zum Login..." />
      </div>
    )
  }

  // Admin-Check wenn erforderlich
  if (requireAdmin) {
    if (!isAdmin) {
      return (
        <div className={styles.container}>
          <Text>Du hast keine Berechtigung für diesen Bereich.</Text>
          <Text size={300} style={{ marginTop: tokens.spacingVerticalM }}>
            Admin-Rechte sind erforderlich.
          </Text>
        </div>
      )
    }
  }

  // Authentifiziert und autorisiert
  return <>{children}</>
}
