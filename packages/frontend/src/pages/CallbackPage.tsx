import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components'
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router-dom';

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

export const CallbackPage: React.FunctionComponent = () => {
  const styles = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      void navigate('/', { replace: true });
    }
  }, [auth.isLoading, auth.error, navigate]);

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
