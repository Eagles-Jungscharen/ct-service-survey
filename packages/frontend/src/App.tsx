import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>ChurchTool Service Survey</h1>
          </header>
          <main className="app-main">
            <p>Willkommen zum ChurchTool Service Survey Tool!</p>
            <p>Die Applikation befindet sich in Entwicklung.</p>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
