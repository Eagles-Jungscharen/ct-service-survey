import { Button, makeStyles, tokens, Text, Card, CardHeader, } from '@fluentui/react-components'
import { CheckmarkCircle24Regular, People24Regular, CalendarLtr24Regular, PersonAvailable24Regular, } from '@fluentui/react-icons'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppAuth } from '../hooks/useAppAuthContext'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacingVerticalXXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    marginBottom: tokens.spacingVerticalXXXL,
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorBrandForeground1,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase500,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalXXL,
    maxWidth: '600px',
    margin: '0 auto',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalXL,
    width: '100%',
    marginBottom: tokens.spacingVerticalXXXL,
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: tokens.spacingVerticalXL,
  },
  featureIcon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalM,
  },
  featureTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
  },
  featureDescription: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  ctaSection: {
    textAlign: 'center',
  },
  ctaButton: {
    fontSize: tokens.fontSizeBase400,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
  },
})

export function HomePage() {
  const styles = useStyles()
  const auth = useAppAuth()
  const navigate = useNavigate()

  // Wenn authentifiziert, redirect zu /surveys
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      void navigate('/surveys')
    }
  }, [auth.isAuthenticated, navigate])

  const handleLogin = React.useCallback(() => {
    auth.login()
  }, [auth])

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>ChurchTools Service Survey</h1>
        <Text className={styles.subtitle}>
          Einfache Verwaltung von Dienst-Umfragen und Einteilungen für deine Gemeinde.
          Mitarbeiter können ihre Verfügbarkeit melden und Teamleiter können
          transparent Einteilungen vornehmen.
        </Text>
      </div>

      <div className={styles.features}>
        <Card className={styles.featureCard}>
          <CalendarLtr24Regular className={styles.featureIcon} />
          <CardHeader
            header={<Text className={styles.featureTitle}>Umfragen erstellen</Text>}
            description={
              <Text className={styles.featureDescription}>
                Erstelle Umfragen für verschiedene Dienste und Termine.
                Füge alle relevanten Informationen hinzu.
              </Text>
            }
          />
        </Card>

        <Card className={styles.featureCard}>
          <CheckmarkCircle24Regular className={styles.featureIcon} />
          <CardHeader
            header={<Text className={styles.featureTitle}>Verfügbarkeit melden</Text>}
            description={
              <Text className={styles.featureDescription}>
                Mitarbeiter können schnell ihre Verfügbarkeit für
                verschiedene Termine angeben.
              </Text>
            }
          />
        </Card>

        <Card className={styles.featureCard}>
          <PersonAvailable24Regular className={styles.featureIcon} />
          <CardHeader
            header={<Text className={styles.featureTitle}>Einteilungen vornehmen</Text>}
            description={
              <Text className={styles.featureDescription}>
                Teamleiter sehen alle Rückmeldungen und können
                transparent Einteilungen vornehmen.
              </Text>
            }
          />
        </Card>

        <Card className={styles.featureCard}>
          <People24Regular className={styles.featureIcon} />
          <CardHeader
            header={<Text className={styles.featureTitle}>Übersicht behalten</Text>}
            description={
              <Text className={styles.featureDescription}>
                Alle Mitarbeiter sehen ihre Einteilungen auf einen Blick
                und werden rechtzeitig informiert.
              </Text>
            }
          />
        </Card>
      </div>

      <div className={styles.ctaSection}>
        <Button
          appearance="primary"
          size="large"
          className={styles.ctaButton}
          onClick={handleLogin}
        >
          Mit ChurchTools anmelden
        </Button>
      </div>
    </div>
  )
}
