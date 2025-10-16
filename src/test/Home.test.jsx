import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from '../pages/Home'

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

test('renders home page with welcome message', async () => {
  render(
    <TestWrapper>
      <Home />
    </TestWrapper>
  )
  
  await waitFor(() => {
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })
  
  expect(screen.getByText(/Your digital wardrobe awaits/i)).toBeInTheDocument()
})
