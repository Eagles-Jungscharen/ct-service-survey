import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from 'react-oidc-context'

import { AppContent } from './components/AppContent'
import { oidcConfig } from './config/oidc'
import { AppAuthContextProvider } from './contexts/AppAuthContextProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export const App: React.FunctionComponent = () => {
  return (
    <AuthProvider {...oidcConfig}>
      <AppAuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </AppAuthContextProvider>
    </AuthProvider>
  )
}

export default App
