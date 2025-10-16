import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const TestWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
)

test('renders app without crashing', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  )
  
  // Check if the app renders without throwing errors
  expect(screen.getByText(/StyleSnap/i)).toBeInTheDocument()
})
