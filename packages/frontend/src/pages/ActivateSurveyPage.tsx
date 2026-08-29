import type { PersonDto } from '@ct-service-survey/shared'
import {
    Button,
    Field,
    Input,
    Label,
    Spinner,
    Text,
    makeStyles,
    tokens,
    Combobox,
    Option,
    Tag,
    TagGroup,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    OptionOnSelectData,
    SelectionEvents,
} from '@fluentui/react-components'
import {
    ArrowLeft24Regular,
    Copy24Regular,
    CheckmarkCircle24Filled,
} from '@fluentui/react-icons'
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { usePersonSearch } from '../hooks/usePersonSearch'
import { useSurvey, useActivateSurvey } from '../hooks/useSurveys'

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingVerticalXXL,
        maxWidth: '800px',
        margin: '0 auto',
    },
    backButton: {
        marginBottom: tokens.spacingVerticalM,
    },
    header: {
        marginBottom: tokens.spacingVerticalXL,
    },
    section: {
        marginBottom: tokens.spacingVerticalXL,
    },
    formGroup: {
        marginBottom: tokens.spacingVerticalL,
    },
    selectedPersonsContainer: {
        marginTop: tokens.spacingVerticalS,
    },
    actions: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalXL,
    },
    successMessage: {
        marginBottom: tokens.spacingVerticalL,
    },
    tagDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalM,
    },
    tagCode: {
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: '2px',
    },
})

export function ActivateSurveyPage() {
    const styles = useStyles()
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { data: survey, isLoading } = useSurvey(id!)
    const activateMutation = useActivateSurvey()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPersons, setSelectedPersons] = useState<PersonDto[]>([])
    const [endDate, setEndDate] = useState('')
    const [activatedTag, setActivatedTag] = useState<string | null>(null)

    const { data: searchResults, isLoading: isSearching } = usePersonSearch(searchQuery)

    // Prüfen ob Survey im Draft-Status ist, sonst redirect
    if (!isLoading && survey && survey.status !== 'draft') {
        void navigate(`/admin/surveys/${id}`)
    }

    const handlePersonSelect = (_event: SelectionEvents, data: OptionOnSelectData) => {
        const selectedId = data.optionValue
        const person = searchResults?.find((p) => p.id === selectedId)
        if (person && !selectedPersons.some((p) => p.id === person.id)) {
            setSelectedPersons([...selectedPersons, person])
            setSearchQuery('') // Suchfeld leeren nach Auswahl
        }
    }

    const handleRemovePerson = (personId: string) => {
        setSelectedPersons(selectedPersons.filter((p) => p.id !== personId))
    }

    const handleActivate = React.useCallback(() => {
        if (!id || selectedPersons.length === 0 || !endDate) return

        const activateAsync = async () => {
            try {
                const result = await activateMutation.mutateAsync({
                    surveyId: id,
                    data: {
                        invitedPersonIds: selectedPersons.map((p) => p.id),
                        endDate: new Date(endDate).toISOString(),
                    },
                })

                // TAG anzeigen
                if (result.accessTag) {
                    setActivatedTag(result.accessTag)
                }
            } catch (error) {
                console.error('Aktivierung fehlgeschlagen:', error)
            }
        }
        void activateAsync()
    }, [id, selectedPersons, endDate, activateMutation]);

    const handleCopyTag = () => {
        if (activatedTag) {
            void navigator.clipboard.writeText(activatedTag)
        }
    }

    const handleBackToSurvey = () => {
        void navigate(`/admin/surveys/${id}`)
    }

    const isFormValid = selectedPersons.length > 0 && endDate !== ''
    const minDate = new Date().toISOString().split('T')[0] // Heute als Minimum

    if (!isLoading && survey && survey.status !== 'draft') {
        return (
            <div>
                <Text>Die Umfrage kann nicht aktiviert werden, da sie sich nicht im Entwurfsstatus befindet.</Text>
                <Link to="/admin/surveys">
                    <Button appearance="primary">
                        Zurück zur Übersicht
                    </Button>
                </Link>
            </div>
        )
    }
    if (isLoading) {
        return (
            <div className={styles.container}>
                <Spinner label="Umfrage wird geladen..." />
            </div>
        )
    }

    if (!survey) {
        return (
            <div className={styles.container}>
                <Text>Umfrage nicht gefunden.</Text>
                <Link to="/admin/surveys">
                    <Button appearance="primary">
                        Zurück zur Übersicht
                    </Button>
                </Link>
            </div>
        )
    }

    // Erfolgsmeldung nach Aktivierung
    if (activatedTag) {
        return (
            <div className={styles.container}>
                <MessageBar intent="success" className={styles.successMessage}>
                    <MessageBarBody>
                        <MessageBarTitle>
                            <CheckmarkCircle24Filled /> Umfrage erfolgreich aktiviert!
                        </MessageBarTitle>
                        Die Umfrage wurde aktiviert und ist nun für die eingeladenen Personen verfügbar.
                    </MessageBarBody>
                </MessageBar>

                <div className={styles.section}>
                    <Label weight="semibold">Zugriffs-TAG:</Label>
                    <div className={styles.tagDisplay}>
                        <Text className={styles.tagCode}>{activatedTag}</Text>
                        <Button
                            icon={<Copy24Regular />}
                            onClick={handleCopyTag}
                            appearance="secondary"
                        >
                            Kopieren
                        </Button>
                    </div>
                    <Text size={300} style={{ marginTop: tokens.spacingVerticalS }}>
                        Personen ohne direkte Einladung können mit diesem TAG auf die Umfrage zugreifen.
                    </Text>
                </div>

                <div className={styles.actions}>
                    <Button onClick={handleBackToSurvey} appearance="primary">
                        Zur Umfrage
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <Link to={`/admin/surveys/${id}`}>
                <Button
                    icon={<ArrowLeft24Regular />}
                    appearance="subtle"
                    className={styles.backButton}
                >
                    Zurück
                </Button>
            </Link>

            <div className={styles.header}>
                <Text as="h1" size={900} weight="bold">
                    Umfrage aktivieren
                </Text>
                <Text size={400}>{survey.title}</Text>
            </div>

            <div className={styles.section}>
                <div className={styles.formGroup}>
                    <Field label="Eingeladene Personen" required>
                        <Combobox
                            placeholder="Person suchen (Name oder E-Mail)..."
                            value={searchQuery}
                            onOptionSelect={handlePersonSelect}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            freeform
                        >
                            {isSearching && <Option key="loading">Suche läuft...</Option>}
                            {!isSearching &&
                                searchResults?.map((person) => (
                                    <Option key={person.id} value={person.id} text={person.name}>
                                        {person.name} {person.email ? `(${person.email})` : ''}
                                    </Option>
                                ))}
                            {!isSearching && searchQuery.length >= 2 && searchResults?.length === 0 && (
                                <Option key="no-results" disabled>
                                    Keine Personen gefunden
                                </Option>
                            )}
                            {!isSearching && searchQuery.length < 2 && searchQuery.length > 0 && (
                                <Option key="min-chars" disabled>
                                    Mindestens 2 Zeichen eingeben
                                </Option>
                            )}
                        </Combobox>
                    </Field>

                    {selectedPersons.length > 0 && (
                        <div className={styles.selectedPersonsContainer}>
                            <Label size="small">Ausgewählte Personen ({selectedPersons.length}):</Label>
                            <TagGroup>
                                {selectedPersons.map((person) => (
                                    <Tag
                                        key={person.id}
                                        dismissible
                                        dismissIcon={{ onClick: () => handleRemovePerson(person.id) }}
                                        value={person.id}
                                    >
                                        {person.name}
                                    </Tag>
                                ))}
                            </TagGroup>
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <Field
                        label="Enddatum der Umfrage"
                        required
                        hint="Nach diesem Datum wird die Umfrage automatisch geschlossen"
                    >
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={minDate}
                        />
                    </Field>
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    onClick={handleActivate}
                    appearance="primary"
                    disabled={!isFormValid || activateMutation.isPending}
                >
                    {activateMutation.isPending ? 'Wird aktiviert...' : 'Umfrage aktivieren'}
                </Button>
                <Link to={`/admin/surveys/${id}`}>
                    <Button appearance="secondary">
                        Abbrechen
                    </Button>
                </Link>
            </div>

            {activateMutation.isError && (
                <MessageBar intent="error" style={{ marginTop: tokens.spacingVerticalM }}>
                    <MessageBarBody>
                        <MessageBarTitle>Fehler bei der Aktivierung</MessageBarTitle>
                        {activateMutation.error instanceof Error
                            ? activateMutation.error.message
                            : 'Ein unbekannter Fehler ist aufgetreten'}
                    </MessageBarBody>
                </MessageBar>
            )}
        </div>
    )
}
