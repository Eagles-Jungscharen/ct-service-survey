import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { AuthProvider } from 'react-oidc-context'
import { oidcConfig } from './config/oidc'
import { AppAuthContextProvider } from './contexts/AppAuthContextProvider'
import { AppContent } from './components/AppContent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export const App:React.FunctionComponent = () => {
  return (
    <FluentProvider theme={webLightTheme}>
      <AuthProvider {...oidcConfig}>
        <AppAuthContextProvider>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </AppAuthContextProvider>
      </AuthProvider>
    </FluentProvider>
  )
}

export default App
