import { useAuth } from 'react-oidc-context'
import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: tokens.spacingVerticalXXL,
  },
})

export function CallbackPage() {
  const styles = useStyles()
  const auth = useAuth()

  // Automatisches Handling durch react-oidc-context
  return (
    <div className={styles.container}>
      {auth.error ? (
        <>
          <Text>Fehler bei der Anmeldung:</Text>
          <Text size={300}>{auth.error.message}</Text>
        </>
      ) : (
        <Spinner label="Anmeldung wird verarbeitet..." />
      )}
    </div>
  )
}
