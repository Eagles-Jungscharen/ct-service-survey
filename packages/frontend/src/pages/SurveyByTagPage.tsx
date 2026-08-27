import {
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { Search24Regular, ErrorCircle24Filled } from '@fluentui/react-icons'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useSurveyByTag } from '../hooks/useSurveys'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  header: {
    marginBottom: tokens.spacingVerticalXXL,
  },
  formGroup: {
    marginBottom: tokens.spacingVerticalL,
    textAlign: 'left',
  },
  tagInput: {
    textAlign: 'center',
    fontSize: '24px',
    fontFamily: 'monospace',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
  message: {
    marginTop: tokens.spacingVerticalL,
    textAlign: 'left',
  },
})

export function SurveyByTagPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { tag: urlTag } = useParams<{ tag?: string }>()

  const [tagInput, setTagInput] = useState(urlTag || '')
  const [searchTag, setSearchTag] = useState<string>('')

  const {
    data: survey,
    isLoading,
    isError,
    error,
  } = useSurveyByTag(searchTag)

  // Bei Direct-Link (URL-Parameter) automatisch suchen
  useEffect(() => {
    if (urlTag && urlTag.length === 6) {
      setSearchTag(urlTag.toUpperCase())
    }
  }, [urlTag])

  // Bei erfolgreichem Fund automatisch zur Umfrage navigieren
  useEffect(() => {
    if (survey) {
      navigate(`/surveys/${survey.id}`)
    }
  }, [survey, navigate])

  // Auto-Suche bei 6 Zeichen
  useEffect(() => {
    if (tagInput.length === 6 && !urlTag) {
      setSearchTag(tagInput.toUpperCase())
    }
  }, [tagInput, urlTag])

  const handleTagChange = (value: string) => {
    // Nur alphanumerische Zeichen erlauben und auf 6 begrenzen
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6)
    setTagInput(cleaned)
    // Bei Löschen auch Suche zurücksetzen
    if (cleaned.length < 6) {
      setSearchTag('')
    }
  }

  const handleSearch = () => {
    if (tagInput.length === 6) {
      setSearchTag(tagInput.toUpperCase())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.length === 6) {
      handleSearch()
    }
  }

  const isValidTag = tagInput.length === 6

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text as="h1" size={900} weight="bold">
          Umfrage öffnen
        </Text>
        <Text size={400}>
          Geben Sie den 6-stelligen Zugriffs-TAG ein, um auf die Umfrage zuzugreifen.
        </Text>
      </div>

      <div className={styles.formGroup}>
        <Field
          label="Zugriffs-TAG"
          hint="6 alphanumerische Zeichen (A-Z, 0-9)"
          required
        >
          <Input
            className={styles.tagInput}
            value={tagInput}
            onChange={(e) => handleTagChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ABC123"
            disabled={isLoading}
            maxLength={6}
            autoFocus
          />
        </Field>
      </div>

      <div className={styles.actions}>
        <Button
          icon={<Search24Regular />}
          onClick={handleSearch}
          appearance="primary"
          disabled={!isValidTag || isLoading}
        >
          {isLoading ? 'Suche läuft...' : 'Umfrage öffnen'}
        </Button>
      </div>

      {isLoading && (
        <div className={styles.message}>
          <Spinner label="Umfrage wird geladen..." />
        </div>
      )}

      {isError && searchTag && (
        <MessageBar intent="error" className={styles.message}>
          <MessageBarBody>
            <MessageBarTitle>
              <ErrorCircle24Filled /> Umfrage nicht gefunden
            </MessageBarTitle>
            {error instanceof Error && error.message.includes('404')
              ? 'Es wurde keine aktive Umfrage mit diesem TAG gefunden. Bitte überprüfen Sie den TAG und versuchen Sie es erneut.'
              : 'Ein Fehler ist beim Laden der Umfrage aufgetreten. Bitte versuchen Sie es später erneut.'}
          </MessageBarBody>
        </MessageBar>
      )}

      {!urlTag && tagInput.length > 0 && tagInput.length < 6 && (
        <Text size={300} className={styles.message}>
          Noch {6 - tagInput.length} Zeichen eingeben
        </Text>
      )}
    </div>
  )
}
