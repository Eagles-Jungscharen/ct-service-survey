import { ReactNode, useEffect } from 'react'
import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components'
import { useAuth } from 'react-oidc-context'

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
  const styles = useStyles()
  const auth = useAuth()

  useEffect(() => {
    // Wenn nicht authentifiziert, redirect zu Login
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect()
    }
  }, [auth.isLoading, auth.isAuthenticated, auth])

  // Während Auth lädt
  if (auth.isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Authentifizierung wird geprüft..." />
      </div>
    )
  }

  // Nicht authentifiziert
  if (!auth.isAuthenticated) {
    return (
      <div className={styles.container}>
        <Spinner label="Weiterleitung zum Login..." />
      </div>
    )
  }

  // Admin-Check wenn erforderlich
  if (requireAdmin && auth.user) {
    const groups = (auth.user.profile.groups as string[]) || []
    const adminGroupId = import.meta.env.VITE_CHURCHTOOL_ADMIN_GROUP_ID || ''
    const isAdmin = adminGroupId ? groups.includes(adminGroupId) : false

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
